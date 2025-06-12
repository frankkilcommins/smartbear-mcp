import { Tool, CallToolRequest, CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { ClientWithHandlers, Handlers } from "../common/types.js";

// Type definitions for tool arguments
export interface suiteArgs {
  suiteId: string;
}

export interface suiteExecutionArgs {
  suiteId: string;
  executionId: string;
}

export interface testArgs {
  testId: string;
}

export interface testExecutionArgs {
  testId: string;
  executionId: string;
}

export interface ToolWithImplementation {
  tool: Tool,
  exec: (request: CallToolRequest) => Promise<CallToolResult>
}

// Tool definitions

export class ReflectClient implements ClientWithHandlers {
  private headers: { "X-API-KEY": string; "Content-Type": string };

  constructor(token: string) {
    this.headers = {
      "X-API-KEY": `${token}`,
      "Content-Type": "application/json",
    };
  }

  async listReflectSuits(): Promise<any> {
    const response = await fetch("https://api.reflect.run/v1/suites", {
      method: "GET",
      headers: this.headers,
    });

    return response.json();
  }

  async listSuiteExecutions(suiteId: string): Promise<any> {
    const response = await fetch(
      `https://api.reflect.run/v1/suites/${suiteId}/executions`,
      {
        method: "GET",
        headers: this.headers,
      },
    );

    return response.json();
  }

  async getSuiteExecutionStatus(suiteId: string, executionId: string): Promise<any> {
    const response = await fetch(
      `https://api.reflect.run/v1/suites/${suiteId}/executions/${executionId}`,
      {
        method: "GET",
        headers: this.headers,
      },
    );

    return response.json();
  }

  async executeSuite(suiteId: string): Promise<any> {
    const response = await fetch(
      `https://api.reflect.run/v1/suites/${suiteId}/executions`,
      {
        method: "POST",
        headers: this.headers,
      },
    );

    return response.json();
  }

  async cancelSuiteExecution(suiteId: string, executionId: string): Promise<any> {
    const response = await fetch(
      `https://api.reflect.run/v1/suites/${suiteId}/executions/${executionId}/cancel`,
      {
        method: "PATCH",
        headers: this.headers,
      },
    );

    return response.json();
  }

  async listReflectTests(): Promise<any> {
    const response = await fetch("https://api.reflect.run/v1/tests", {
      method: "GET",
      headers: this.headers,
    });

    return response.json();
  }

  async runReflectTest(testId: string): Promise<any> {
    const response = await fetch(`https://api.reflect.run/v1/tests/${testId}/executions`, {
      method: "POST",
      headers: this.headers,
    });

    return response.json();
  }

  async getReflectTestStatus(testId: string, executionId: string): Promise<any> {
    const response = await fetch(
      `https://api.reflect.run/v1/executions/${executionId}`,
      {
        method: "GET",
        headers: this.headers,
      },
    );

    return response.json();
  }

  getTools(): ToolWithImplementation[] {
    return [
      {
        tool: {
          name: "list_reflect_suites",
          description: "List all reflect suites",
          inputSchema: {
            type: "object",
            properties: {}
          }
        },
        exec: async () => {
          const response = await this.listReflectSuits();
          return {
            content: [{ type: "text", text: JSON.stringify(response) }],
          };
        },
      },
      {
        tool: {
          name: "list_reflect_suite_executions",
          description: "List all executions for a given reflect suite",
          inputSchema: {
            type: "object",
            properties: {
              suiteId: {
                type: "string",
                description: "ID of the reflect suite to list executions for",
              },
            },
            required: ["suiteId"]
          }
        },
        exec: async (request: CallToolRequest) => {
          const args = request.params.arguments as unknown as suiteArgs;
          if (!args.suiteId) {
            throw new Error("suiteId argument is required");
          }
          const response = await this.listSuiteExecutions(args.suiteId);
          return {
            content: [{ type: "text", text: JSON.stringify(response) }],
          };
        },
      },
      {
        tool: {
          name: "reflect_suite_execution_status",
          description: "Get the status of a reflect suite execution",
          inputSchema: {
            type: "object",
            properties: {
              suiteId: {
                type: "string",
                description: "ID of the reflect suite to list executions for",
              },
              executionId: {
                type: "string",
                description: "ID of the reflect suite execution to get status for",
              },
            },
            required: ["suiteId", "executionId"]
          }
        },
        exec: async (request: CallToolRequest) => {
          const args = request.params.arguments as unknown as suiteExecutionArgs;
          if (!args.suiteId || !args.executionId) {
            throw new Error("Both suiteId and executionId arguments are required");
          }
          const response = await this.getSuiteExecutionStatus(args.suiteId, args.executionId);
          return {
            content: [{ type: "text", text: JSON.stringify(response) }],
          };
        },
      },
      {
        tool: {
          name: "reflect_suite_execution",
          description: "Execute a reflect suite",
          inputSchema: {
            type: "object",
            properties: {
              suiteId: {
                type: "string",
                description: "ID of the reflect suite to list executions for",
              },
            },
            required: ["suiteId"]
          }
        },
        exec: async (request: CallToolRequest) => {
          const args = request.params.arguments as unknown as suiteArgs;
          if (!args.suiteId) {
            throw new Error("suiteId argument is required");
          }
          const response = await this.executeSuite(args.suiteId);
          return {
            content: [{ type: "text", text: JSON.stringify(response) }],
          };
        },
      },
      {
        tool: {
          name: "cancel_reflect_suite_execution",
          description: "Cancel a reflect suite execution",
          inputSchema: {
            type: "object",
            properties: {
              suiteId: {
                type: "string",
                description: "ID of the reflect suite to cancel execution for",
              },
              executionId: {
                type: "string",
                description: "ID of the reflect suite execution to cancel",
              },
            },
            required: ["suiteId", "executionId"]
          }
        },
        exec: async (request: CallToolRequest) => {
          const args = request.params.arguments as unknown as suiteExecutionArgs;
          if (!args.suiteId || !args.executionId) {
            throw new Error("Both suiteId and executionId arguments are required");
          }
          const response = await this.cancelSuiteExecution(args.suiteId, args.executionId);
          return {
            content: [{ type: "text", text: JSON.stringify(response) }],
          };
        },
      },
      {
        tool: {
          name: "list_reflect_tests",
          description: "List all reflect tests",
          inputSchema: {
            type: "object",
            properties: {}
          }
        },
        exec: async () => {
          const response = await this.listReflectTests();
          return {
            content: [{ type: "text", text: JSON.stringify(response) }],
          };
        },
      },
      {
        tool: {
          name: "run_reflect_test",
          description: "Run a reflect test",
          inputSchema: {
            type: "object",
            properties: {
              testId: {
                type: "string",
                description: "ID of the reflect test to run",
              },
            },
            required: ["testId"]
          }
        },
        exec: async (request: CallToolRequest) => {
          const args = request.params.arguments as unknown as testArgs;
          if (!args.testId) {
            throw new Error("testId argument is required");
          }
          const response = await this.runReflectTest(args.testId);
          return {
            content: [{ type: "text", text: JSON.stringify(response) }],
          };
        },
      },
      {
        tool: {
          name: "reflect_test_status",
          description: "Get the status of a reflect test execution",
          inputSchema: {
            type: "object",
            properties: {
              testId: {
                type: "string",
                description: "ID of the reflect test to run",
              },
              executionId: {
                type: "string",
                description: "ID of the reflect test execution to get status for",
              },
            },
            required: ["testId", "executionId"]
          }
        },
        exec: async (request: CallToolRequest) => {
          const args = request.params.arguments as unknown as testExecutionArgs;
          if (!args.testId || !args.executionId) {
            throw new Error("Both testId and executionId arguments are required");
          }
          const response = await this.getReflectTestStatus(args.testId, args.executionId);
          return {
            content: [{ type: "text", text: JSON.stringify(response) }],
          };
        },
      }
    ];
  }

  getHandlers(): Handlers {
    return {
      list_reflect_suites: async () => {
        const response = await this.listReflectSuits();
        return {
          content: [{ type: "text", text: JSON.stringify(response) }],
        };
      },

      list_reflect_suite_executions: async (request: CallToolRequest) => {
        const args = request.params.arguments as unknown as suiteArgs;
        if (!args.suiteId) {
          throw new Error("suiteId argument is required");
        }
        const response = await this.listSuiteExecutions(args.suiteId);
        return {
          content: [{ type: "text", text: JSON.stringify(response) }],
        };
      },

      reflect_suite_execution: async (request: CallToolRequest) => {
        const args = request.params.arguments as unknown as suiteArgs;
        if (!args.suiteId) {
          throw new Error("suiteId argument is required");
        }
        const response = await this.executeSuite(args.suiteId);
        return {
          content: [{ type: "text", text: JSON.stringify(response) }],
        };
      },

      reflect_suite_execution_status: async (request: CallToolRequest) => {
        const args = request.params.arguments as unknown as suiteExecutionArgs;
        if (!args.suiteId || !args.executionId) {
          throw new Error("Both suiteId and executionId arguments are required");
        }
        const response = await this.getSuiteExecutionStatus(args.suiteId, args.executionId);
        return {
          content: [{ type: "text", text: JSON.stringify(response) }],
        };
      },

      cancel_reflect_suite_execution: async (request: CallToolRequest) => {
        const args = request.params.arguments as unknown as suiteExecutionArgs;
        if (!args.suiteId || !args.executionId) {
          throw new Error("Both suiteId and executionId arguments are required");
        }
        const response = await this.cancelSuiteExecution(args.suiteId, args.executionId);
        return {
          content: [{ type: "text", text: JSON.stringify(response) }],
        };
      },

      list_reflect_tests: async () => {
        const response = await this.listReflectTests();
        return {
          content: [{ type: "text", text: JSON.stringify(response) }],
        };
      },

      run_reflect_test: async (request: CallToolRequest) => {
        const args = request.params.arguments as unknown as testArgs;
        if (!args.testId) {
          throw new Error("testId argument is required");
        }
        const response = await this.runReflectTest(args.testId);
        return {
          content: [{ type: "text", text: JSON.stringify(response) }],
        };
      },

      reflect_test_status: async (request: CallToolRequest) => {
        const args = request.params.arguments as unknown as testExecutionArgs;
        if (!args.testId || !args.executionId) {
          throw new Error("Both testId and executionId arguments are required");
        }
        const response = await this.getReflectTestStatus(args.testId, args.executionId);
        return {
          content: [{ type: "text", text: JSON.stringify(response) }],
        };
      },
    };
  }
}