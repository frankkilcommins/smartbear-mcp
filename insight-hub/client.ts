import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { MCP_SERVER_NAME, MCP_SERVER_VERSION } from "../common/info.js";
import { Client } from "../common/types.js";
import { CurrentUserAPI, ErrorAPI, Configuration } from "./client/index.js";
import { z } from "zod";
import Bugsnag from "../common/bugsnag.js";
import NodeCache from "node-cache";
import { Organization, Project } from "./client/api/CurrentUser.js";
import { ProjectAPI } from "./client/api/Project.js";

const cacheKeys = {
  ORG: "insight_hub_org",
  PROJECTS: "insight_hub_projects",
  CURRENT_PROJECT: "insight_hub_current_project",
  PROJECT_EVENT_FIELDS: "insight_hub_project_event_fields",
}

// Type definitions for tool arguments
export interface ProjectArgs {
  projectId: string;
}

export interface OrgArgs {
  orgId: string;
}

export interface ErrorArgs extends ProjectArgs {
  errorId: string;
}

export class InsightHubClient implements Client {
  private currentUserApi: CurrentUserAPI;
  private errorsApi: ErrorAPI;
  private cache: NodeCache;
  private projectApi: ProjectAPI;
  private projectApiKey?: string;

  constructor(token: string, projectApiKey?: string) {
    const config = new Configuration({
      authToken: token,
      headers: {
        "User-Agent": `${MCP_SERVER_NAME}/${MCP_SERVER_VERSION}`,
        "Content-Type": "application/json",
      },
      basePath: "https://api.bugsnag.com",
    });
    this.currentUserApi = new CurrentUserAPI(config);
    this.errorsApi = new ErrorAPI(config);
    this.cache = new NodeCache();
    this.projectApi = new ProjectAPI(config);
    this.projectApiKey = projectApiKey;
  }

  async initialize(): Promise<void> {
    const orgs = await this.listOrgs();
    if (!orgs || orgs.length === 0) {
      throw new Error("No organizations found for the current user.");
    }
    // We should only have one org
    this.cache.set(cacheKeys.ORG, orgs[0]);
    const projects = await this.listProjects(orgs[0].id);
    this.cache.set(cacheKeys.PROJECTS, projects);
    if (this.projectApiKey) {
      const project = projects.find((project) => project.api_key === this.projectApiKey)
      if (!project) {
        throw new Error(`Project with API key ${this.projectApiKey} not found in organization ${orgs[0].name}.`);
      }
      this.cache.set(cacheKeys.CURRENT_PROJECT, project);
      const projectFields = await this.listProjectEventFields(project.id);
      if (!projectFields || projectFields.length === 0) {
        throw new Error(`No event fields found for project ${project.name}.`);
      }
      this.cache.set(cacheKeys.PROJECT_EVENT_FIELDS, projectFields);
    }
  }

  async listProjectEventFields(projectId: string) {
    return this.projectApi.listProjectEventFields(projectId);
  }

  async listOrgs(): Promise<any> {
    return this.currentUserApi.listUserOrganizations();
  }

  async listProjects(orgId: string, options?: any): Promise<Project[]> {
    options = {
      ...options,
      paginate: true
    };
    return this.currentUserApi.getOrganizationProjects(orgId, options);
  }

  // This method retrieves all orojects for the organization stored in the cache.
  // If no projects are found in the cache, it fetches them from the API and
  // stores them in the cache for future use.
  // It throws an error if no organizations are found in the cache.
  async getProjects(): Promise<Project[]> {
    let projects = this.cache.get<Project[]>(cacheKeys.PROJECTS);
    if (!projects) {
      const org = this.cache.get<Organization>(cacheKeys.ORG);
      if (!org) {
        throw new Error("No organization found in cache.");
      }
      projects = await this.listProjects(org.id);
      this.cache.set(cacheKeys.PROJECTS, projects);
    }
    if (!projects) {
      throw new Error("No projects found.");
    }
    return projects;
  }

  async getErrorDetails(projectId: string, errorId: string): Promise<any> {
    return this.errorsApi.viewErrorOnProject(projectId, errorId);
  }

  async getLatestErrorEvent(errorId: string): Promise<any> {
    return this.errorsApi.viewLatestEventOnError(errorId);
  }

  async getProjectEvent(projectId: string, eventId: string): Promise<any> {
    return this.errorsApi.viewEventById(projectId, eventId);
  }

  async findEventById(eventId: string): Promise<any> {
    const projects = await this.listOrgs().then(([org]) => this.listProjects(org.id));
    const eventDetails = await Promise.all(projects.map((p: any) => this.getProjectEvent(p.id, eventId).catch(_e => null)));
    return eventDetails.find(event => !!event);
  }

  registerTools(server: McpServer): void {
    server.tool(
      "list_insight_hub_projects",
      "List all projects in an organization",
      {
        page_size: z.number().optional().describe("Number of projects to return per page"),
        page: z.number().optional().describe("Page number to return"),
      },
      async (args, _extra) => {
        try {
          let projects = await this.getProjects();
          if (!projects || projects.length === 0) {
            return {
              content: [{ type: "text", text: "No projects found." }],
            };
          }
          if (args.page_size || args.page) {
            const pageSize = args.page_size || 10;
            const page = args.page || 1;
            projects = projects.slice((page - 1) * pageSize, page * pageSize);
          }
          return {
            content: [{ type: "text", text: JSON.stringify(projects) }],
          };
        } catch (e) {
          Bugsnag.notify(e as unknown as Error);
          throw e;
        }
      }
    );
    server.tool(
      "get_insight_hub_error",
      "Get error details from a project",
      {
        projectId: z.string().optional().describe("ID of the project"),
        errorId: z.string().describe("ID of the error to fetch"),
      },
      async (args, _extra) => {
        try {
          const projectId = args.projectId || this.cache.get<Project>(cacheKeys.CURRENT_PROJECT)?.id;
          if (!projectId || !args.errorId) throw new Error("Both projectId and errorId arguments are required");
          const response = await this.getErrorDetails(projectId, args.errorId);
          return {
            content: [{ type: "text", text: JSON.stringify(response) }],
          };
        } catch (e) {
          Bugsnag.notify(e as unknown as Error);
          throw e;
        }
      }
    );
    server.tool(
      "get_insight_hub_error_latest_event",
      "Get the latest event for an error",
      {
        errorId: z.string().describe("ID of the error to get the latest event for"),
      },
      async (args, _extra) => {
        try {
          if (!args.errorId) throw new Error("errorId argument is required");
          const response = await this.getLatestErrorEvent(args.errorId);
          return {
            content: [{ type: "text", text: JSON.stringify(response) }],
          };
        } catch (e) {
          Bugsnag.notify(e as unknown as Error);
          throw e;
        }
      }
    );
    server.tool(
      "get_insight_hub_event_details",
      "Get details of a specific event on Insight Hub",
      {
        link: z.string().describe("Link to the event details"),
      },
      async (args, _extra) => {
        try {
          if (!args.link) throw new Error("link argument is required");
          const url = new URL(args.link);
          const eventId = url.searchParams.get("event_id");
          const projectSlug = url.pathname.split('/')[2];
          if (!projectSlug || !eventId) throw new Error("Both projectSlug and eventId must be present in the link");

          // get the project id from list of projects
          const projects = this.cache.get<Project[]>("insight_hub_projects");
          if (!projects) {
            throw new Error("No projects found in cache.");
          }
          const projectId = projects.find((p: any) => p.slug === projectSlug)?.id;
          if (!projectId) {
            throw new Error("Project with the specified slug not found.");
          }

          const response = await this.getProjectEvent(projectId, eventId);
          return {
            content: [{ type: "text", text: JSON.stringify(response) }],
          };
        } catch (e) {
          Bugsnag.notify(e as unknown as Error);
          throw e;
        }
      }
    )
  }

  registerResources(server: McpServer): void {
    server.resource(
      "insight_hub_event",
      new ResourceTemplate("insighthub://event/{id}", { list: undefined }),
      async (uri, { id }) => {
        try {
          return {
            contents: [{
              uri: uri.href,
              text: JSON.stringify(await this.findEventById(id as string))
            }]
          }
        } catch (e) {
          Bugsnag.notify(e as unknown as Error);
          throw e;
        }
      }
    )
  }
}
