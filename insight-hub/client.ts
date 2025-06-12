import { CallToolRequest } from "@modelcontextprotocol/sdk/types.js";
import { ClientWithTools, ToolWithImplementation } from "../common/types.js";
import { CurrentUserApi, ProjectsApi, ErrorsApi, Configuration } from "./client/index.js";

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

export class InsightHubClient implements ClientWithTools {
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

  getTools(): ToolWithImplementation[] {
    return [
      {
        tool: {
          name: "list_insight_hub_orgs",
          description: "List all organizations",
          inputSchema: {
            type: "object",
            properties: {}
          }
        },
        exec: async () => {
          const response = await this.listOrgs();
          return {
            content: [{ type: "text", text: JSON.stringify(response) }],
          };
        },
      },
      {
        tool: {
          name: "list_insight_hub_projects",
          description: "List all projects in an organization",
          inputSchema: {
            type: "object",
            properties: {
              orgId: {
                type: "string",
                description: "ID of the organization to list projects for",
              },
            },
            required: ["orgId"]
          }
        },
        exec: async (request: CallToolRequest) => {
          const args = request.params.arguments as unknown as OrgArgs;
          if (!args.orgId) {
            throw new Error("orgId argument is required");
          }
          const response = await this.listProjects(args.orgId);
          return {
            content: [{ type: "text", text: JSON.stringify(response) }],
          };
        },
      },
      {
        tool: {
          name: "get_insight_hub_error",
          description: "Get error details from a project",
          inputSchema: {
            type: "object",
            properties: {
              projectId: {
                type: "string",
                description: "ID of the project",
              },
              errorId: {
                type: "string",
                description: "ID of the error to fetch",
              },
            },
            required: ["projectId", "errorId"]
          }
        },
        exec: async (request: CallToolRequest) => {
          const args = request.params.arguments as unknown as ErrorArgs;
          if (!args.projectId || !args.errorId) {
            throw new Error("Both projectId and errorId arguments are required");
          }
          const response = await this.getErrorDetails(args.projectId, args.errorId);
          return {
            content: [{ type: "text", text: JSON.stringify(response) }],
          };
        },
      },
      {
        tool: {
          name: "get_insight_hub_error_latest_event",
          description: "Get the latest event for an error",
          inputSchema: {
            type: "object",
            properties: {
              projectId: {
                type: "string",
                description: "ID of the project",
              },
              errorId: {
                type: "string",
                description: "ID of the error to get the latest event for",
              },
            },
            required: ["projectId", "errorId"]
          }
        },
        exec: async (request: CallToolRequest) => {
          const args = request.params.arguments as unknown as ErrorArgs;
          if (!args.projectId || !args.errorId) {
            throw new Error("Both projectId and errorId arguments are required");
          }
          const response = await this.getLatestErrorEvent(args.projectId, args.errorId);
          return {
            content: [{ type: "text", text: JSON.stringify(response) }],
          };
        },
      },
    ];
  }
}
