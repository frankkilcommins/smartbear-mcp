#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequest,
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from "@modelcontextprotocol/sdk/types.js";
import { cancelReflectSuiteExecutionTool, listReflectSuiteExecutionsTool, listReflectSuitesTool, listReflectTestsTool, ReflectClient, reflectSuiteExecutionStatusTool, reflectSuiteExecutionTool, reflectTestStatusTool, runReflectTestsTool, suiteArgs, suiteExecutionArgs, testArgs, testExecutionArgs } from "./reflect/client.js";

// Type definitions for tool arguments
interface echoArgs {
  input: string;
}

// Tool definitions
const echoTool: Tool = {
  name: "echo",
  description: "Return the input argument",
  inputSchema: {
    type: "object",
    properties: {
      input: {
        type: "string",
        description: "Input to be printed",
      },
    },
    required: ["input"],
  },
};


async function main() {
  const token = process.env.REFLECT_API_TOKEN;

  if (!token) {
    console.error(
      "Please set REFLECT_API_TOKEN environment variables",
    );
    process.exit(1);
  }

  console.error("Starting SmartBear MCP Server...");
  const server = new Server(
    {
      name: "SmartBear MCP Server",
      version: "1.0.0",
    },
    {
      capabilities: {
        tools: {},
      },
    },
  );

  const reflectClient = new ReflectClient(token);

  server.setRequestHandler(
    CallToolRequestSchema,
    async (request: CallToolRequest) => {
      console.error("Received CallToolRequest:", request);
      try {
        if (!request.params.arguments) {
          throw new Error("No arguments provided");
        }

        switch (request.params.name) {
          case "echo": {
            const args = request.params
              .arguments as unknown as echoArgs;
            return {
              content: [{ type: "text", text: `${args.input}` }],
            };
          }

          case "list_reflect_suites": {
            const response = await reflectClient.listReflectSuits();
            return {
              content: [{ type: "text", text: JSON.stringify(response) }],
            };
          }

          case "list_reflect_suite_executions": {
            const args = request.params
              .arguments as unknown as suiteArgs;
            if (!args.suiteId) {
              throw new Error("suiteId argument is required");
            }
            const response = await reflectClient.listSuiteExecutions(args.suiteId);
            return {
              content: [{ type: "text", text: JSON.stringify(response) }],
            };
          }

          case "reflect_suite_execution": {
            const args = request.params
              .arguments as unknown as suiteArgs;
            if (!args.suiteId) {
              throw new Error("suiteId argument is required");
            }
            const response = await reflectClient.executeSuite(args.suiteId);
            return {
              content: [{ type: "text", text: JSON.stringify(response) }],
            };
          }

          case "reflect_suite_execution_status": {
            const args = request.params
              .arguments as unknown as suiteExecutionArgs;
            if (!args.suiteId || !args.executionId) {
              throw new Error("Both suiteId and executionId arguments are required");
            }
            const response = await reflectClient.getSuiteExecutionStatus(args.suiteId, args.executionId);
            return {
              content: [{ type: "text", text: JSON.stringify(response) }],
            };
          }

          case "cancel_reflect_suite_execution": {
            const args = request.params
              .arguments as unknown as suiteExecutionArgs;
            if (!args.suiteId || !args.executionId) {
              throw new Error("Both suiteId and executionId arguments are required");
            }
            const response = await reflectClient.cancelSuiteExecution(args.suiteId, args.executionId);
            return {
              content: [{ type: "text", text: JSON.stringify(response) }],
            };
          }

          case "list_reflect_tests": {
            const response = await reflectClient.listReflectTests();
            return {
              content: [{ type: "text", text: JSON.stringify(response) }],
            };
          }

          case "run_reflect_test": {
            const args = request.params
              .arguments as unknown as testArgs;
            if (!args.testId) {
              throw new Error("testId argument is required");
            }
            const response = await reflectClient.runReflectTest(args.testId);
            return {
              content: [{ type: "text", text: JSON.stringify(response) }],
            };
          }

          case "reflect_test_status": {
            const args = request.params
              .arguments as unknown as testExecutionArgs;
            if (!args.testId || !args.executionId) {
              throw new Error("Both testId and executionId arguments are required");
            }
            const response = await reflectClient.getReflectTestStatus(args.testId, args.executionId);
            return {
              content: [{ type: "text", text: JSON.stringify(response) }],
            };
          }

          default:
            throw new Error(`Unknown tool: ${request.params.name}`);
        }
      } catch (error) {
        console.error("Error executing tool:", error);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                error: error instanceof Error ? error.message : String(error),
              }),
            },
          ],
        };
      }
    },
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => {
    console.error("Received ListToolsRequest");
    return {
      tools: [
        echoTool,
        listReflectSuitesTool,
        listReflectSuiteExecutionsTool,
        reflectSuiteExecutionStatusTool,
        reflectSuiteExecutionTool,
        cancelReflectSuiteExecutionTool,
        listReflectTestsTool,
        runReflectTestsTool,
        reflectTestStatusTool
      ],
    };
  });

  const transport = new StdioServerTransport();
  console.error("Connecting server to transport...");
  await server.connect(transport);

  console.error("SmartBear MCP Server running...");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});