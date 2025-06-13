import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { Client } from "../common/types.js";
import { CurrentUserApi, ProjectsApi, ErrorsApi, Configuration } from "./client/index.js";
import { z } from "zod";

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
  private currentUserApi: CurrentUserApi;
  private projectsApi: ProjectsApi;
  private errorsApi: ErrorsApi;

  constructor(token: string) {
    const config = new Configuration({
      apiKey: `token ${token}`,
      basePath: "https://api.bugsnag.com",
    });
    this.currentUserApi = new CurrentUserApi(config);
    this.projectsApi = new ProjectsApi(config);
    this.errorsApi = new ErrorsApi(config);
  }

  async listOrgs(): Promise<any> {
    return this.currentUserApi.listUserOrganizations();
  }

  async listProjects(orgId: string): Promise<any> {
    return this.currentUserApi.getOrganizationProjects(orgId);
  }

  async getErrorDetails(projectId: string, errorId: string): Promise<any> {
    return this.errorsApi.viewErrorOnProject(projectId, errorId);
  }

  async getLatestErrorEvent(projectId: string, errorId: string): Promise<any> {
    return this.errorsApi.viewLatestEventOnError(errorId);
  }

  registerTools(server: McpServer): void {
    server.tool(
      "list_insight_hub_orgs",
      "List all organizations",
      {},
      async (_args, _extra) => {
        const response = await this.listOrgs();
        return {
          content: [{ type: "text", text: JSON.stringify(response) }],
        };
      }
    );
    server.tool(
      "list_insight_hub_projects",
      "List all projects in an organization",
      { orgId: z.string().describe("ID of the organization to list projects for") },
      async (args, _extra) => {
        if (!args.orgId) throw new Error("orgId argument is required");
        const response = await this.listProjects(args.orgId);
        return {
          content: [{ type: "text", text: JSON.stringify(response) }],
        };
      }
    );
    server.tool(
      "get_insight_hub_error",
      "Get error details from a project",
      {
        projectId: z.string().describe("ID of the project"),
        errorId: z.string().describe("ID of the error to fetch"),
      },
      async (args, _extra) => {
        if (!args.projectId || !args.errorId) throw new Error("Both projectId and errorId arguments are required");
        const response = await this.getErrorDetails(args.projectId, args.errorId);
        return {
          content: [{ type: "text", text: JSON.stringify(response) }],
        };
      }
    );
    server.tool(
      "get_insight_hub_error_latest_event",
      "Get the latest event for an error",
      {
        projectId: z.string().describe("ID of the project"),
        errorId: z.string().describe("ID of the error to get the latest event for"),
      },
      async (args, _extra) => {
        if (!args.projectId || !args.errorId) throw new Error("Both projectId and errorId arguments are required");
        const response = await this.getLatestErrorEvent(args.projectId, args.errorId);
        return {
          content: [{ type: "text", text: JSON.stringify(response) }],
        };
      }
    );
  }

  registerResources(server: McpServer): void {
  }
}
