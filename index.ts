#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequest,
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from "@modelcontextprotocol/sdk/types.js";
import { ReflectClient, cancelReflectSuiteExecutionTool, listReflectSuiteExecutionsTool, listReflectSuitesTool, listReflectTestsTool, reflectSuiteExecutionStatusTool, reflectSuiteExecutionTool, reflectTestStatusTool, runReflectTestsTool } from "./reflect/client.js";

async function main() {
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

  const reflectToken = process.env.REFLECT_API_TOKEN;
  const insightHubToken = process.env.INSIGHT_HUB_API_TOKEN;

  if (!reflectToken && !insightHubToken) {
    console.error(
      "Please set REFLECT_API_TOKEN or INSIGHT_HUB_API_TOKEN environment variables",
    );
    process.exit(1);
  }

  const reflectClient = reflectToken ? new ReflectClient(reflectToken) : null;

  server.setRequestHandler(
    CallToolRequestSchema,
    async (request: CallToolRequest) => {
      console.error("Received CallToolRequest:", request);
      try {
        if (!request.params.arguments) {
          throw new Error("No arguments provided");
        }

        const handlers = {
          ...(reflectClient ? reflectClient.getHandlers() : {}),
        };

        const handler = handlers[request.params.name];
        if (!handler) {
          throw new Error(`Unknown tool: ${request.params.name}`);
        }

        return await handler(request);
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