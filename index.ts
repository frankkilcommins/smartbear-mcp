#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequest,
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from "@modelcontextprotocol/sdk/types.js";
import { ReflectClient } from "./reflect/client.js";

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

const listReflectSuitesTool: Tool = {
  name: "list_reflect_suites",
  description: "List all reflect suites",
  inputSchema: {
    type: "object",
    properties: {
    },
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

          case "list_reflect_suits": {
            const response = await reflectClient.listReflectSuits();
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
        listReflectSuitesTool
      ],
    };
  });

  const transport = new StdioServerTransport();
  console.error("Connecting server to transport...");
  await server.connect(transport);

  console.error("Slack MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});