#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequest,
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { ReflectClient } from "./reflect/client.js";
import { InsightHubClient } from "./insight-hub/client.js";
import { ToolWithImplementation } from "./common/types.js";

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
  const insightHubToken = process.env.INSIGHT_HUB_AUTH_TOKEN;

  if (!reflectToken && !insightHubToken) {
    console.error(
      "Please set REFLECT_API_TOKEN or INSIGHT_HUB_AUTH_TOKEN environment variables",
    );
    process.exit(1);
  }

  const tools: ToolWithImplementation[] = []

  if (reflectToken) {
    tools.push(...new ReflectClient(reflectToken).getTools());
  }

  if (insightHubToken) {
    tools.push(...new InsightHubClient(insightHubToken).getTools());
  }

  server.setRequestHandler(
    CallToolRequestSchema,
    async (request: CallToolRequest) => {
      console.error("Received CallToolRequest:", request);
      try {
        if (!request.params.arguments) {
          throw new Error("No arguments provided");
        }

        const tool = tools.find(({ tool }) => tool.name === request.params.name);
        if (!tool) {
          throw new Error(`Unknown tool: ${request.params.name}`);
        }

        return await tool.exec(request);
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
    return { tools: tools.map(({ tool }) => tool) };
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