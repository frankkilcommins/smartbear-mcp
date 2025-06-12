import { CallToolRequest } from "@modelcontextprotocol/sdk/types.js";
import { ClientWithTools, ToolWithImplementation } from "../common/types.js";

// Type definitions for tool arguments
export interface ProjectArgs {
  projectId: string;
}

export interface DashboardArgs {
  dashboardId: string;
}

export interface MetricArgs extends DashboardArgs {
  metricId: string;
}

export interface OrgArgs {
  orgId: string;
}

export interface ErrorArgs extends ProjectArgs {
  errorId: string;
}

export class InsightHubClient implements ClientWithTools {
  private headers: { "Authorization": string; "Content-Type": string };
  private baseUrl: string = "https://api.bugsnag.com";

  constructor(token: string) {
    this.headers = {
      "Authorization": `token ${token}`,
      "Content-Type": "application/json",
    };
  }

  async listOrgs(): Promise<any> {
    const response = await fetch(`${this.baseUrl}/user/organizations`, {
      method: "GET",
      headers: this.headers,
    });
    return response.json();
  }

  async listProjects(orgId: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}/organizations/${orgId}/projects`, {
      method: "GET",
      headers: this.headers,
    });
    return response.json();
  }

  async getErrorDetails(projectId: string, errorId: string): Promise<any> {
    const response = await fetch(
      `${this.baseUrl}/v1/projects/${projectId}/errors/${errorId}`,
      {
        method: "GET",
        headers: this.headers,
      }
    );
    return response.json();
  }

  async getLatestErrorEvent(projectId: string, errorId: string): Promise<any> {
    const response = await fetch(
      `${this.baseUrl}/v1/projects/${projectId}/errors/${errorId}/events/latest`,
      {
        method: "GET",
        headers: this.headers,
      }
    );
    return response.json();
  }

  async listDashboards(projectId: string): Promise<any> {
    const response = await fetch(
      `${this.baseUrl}/v1/projects/${projectId}/dashboards`,
      {
        method: "GET",
        headers: this.headers,
      }
    );
    return response.json();
  }

  async getDashboardMetrics(dashboardId: string): Promise<any> {
    const response = await fetch(
      `${this.baseUrl}/v1/dashboards/${dashboardId}/metrics`,
      {
        method: "GET",
        headers: this.headers,
      }
    );
    return response.json();
  }

  async getMetricDetails(dashboardId: string, metricId: string): Promise<any> {
    const response = await fetch(
      `${this.baseUrl}/v1/dashboards/${dashboardId}/metrics/${metricId}`,
      {
        method: "GET",
        headers: this.headers,
      }
    );
    return response.json();
  }

  async refreshDashboard(dashboardId: string): Promise<any> {
    const response = await fetch(
      `${this.baseUrl}/v1/dashboards/${dashboardId}/refresh`,
      {
        method: "POST",
        headers: this.headers,
      }
    );
    return response.json();
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
      {
        tool: {
          name: "list_insight_hub_dashboards",
          description: "List all dashboards for a project",
          inputSchema: {
            type: "object",
            properties: {
              projectId: {
                type: "string",
                description: "ID of the project to list dashboards for",
              },
            },
            required: ["projectId"]
          }
        },
        exec: async (request: CallToolRequest) => {
          const args = request.params.arguments as unknown as ProjectArgs;
          if (!args.projectId) {
            throw new Error("projectId argument is required");
          }
          const response = await this.listDashboards(args.projectId);
          return {
            content: [{ type: "text", text: JSON.stringify(response) }],
          };
        },
      },
      {
        tool: {
          name: "get_insight_hub_dashboard_metrics",
          description: "Get metrics for a dashboard",
          inputSchema: {
            type: "object",
            properties: {
              dashboardId: {
                type: "string",
                description: "ID of the dashboard to get metrics for",
              },
            },
            required: ["dashboardId"]
          }
        },
        exec: async (request: CallToolRequest) => {
          const args = request.params.arguments as unknown as DashboardArgs;
          if (!args.dashboardId) {
            throw new Error("dashboardId argument is required");
          }
          const response = await this.getDashboardMetrics(args.dashboardId);
          return {
            content: [{ type: "text", text: JSON.stringify(response) }],
          };
        },
      },
      {
        tool: {
          name: "get_insight_hub_metric_details",
          description: "Get details for a specific metric",
          inputSchema: {
            type: "object",
            properties: {
              dashboardId: {
                type: "string",
                description: "ID of the dashboard",
              },
              metricId: {
                type: "string",
                description: "ID of the metric to get details for",
              },
            },
            required: ["dashboardId", "metricId"]
          }
        },
        exec: async (request: CallToolRequest) => {
          const args = request.params.arguments as unknown as MetricArgs;
          if (!args.dashboardId || !args.metricId) {
            throw new Error("Both dashboardId and metricId arguments are required");
          }
          const response = await this.getMetricDetails(args.dashboardId, args.metricId);
          return {
            content: [{ type: "text", text: JSON.stringify(response) }],
          };
        },
      },
      {
        tool: {
          name: "refresh_insight_hub_dashboard",
          description: "Refresh a dashboard",
          inputSchema: {
            type: "object",
            properties: {
              dashboardId: {
                type: "string",
                description: "ID of the dashboard to refresh",
              },
            },
            required: ["dashboardId"]
          }
        },
        exec: async (request: CallToolRequest) => {
          const args = request.params.arguments as unknown as DashboardArgs;
          if (!args.dashboardId) {
            throw new Error("dashboardId argument is required");
          }
          const response = await this.refreshDashboard(args.dashboardId);
          return {
            content: [{ type: "text", text: JSON.stringify(response) }],
          };
        },
      },
    ];
  }
}