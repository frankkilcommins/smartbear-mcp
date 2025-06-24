#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { ReflectClient } from "./reflect/client.js";
import { InsightHubClient } from "./insight-hub/client.js";
import Bugsnag from "./common/bugsnag.js";
import { ApiHubClient } from "./api-hub/client.js";

// This is used to report errors in the MCP server itself
// If you want to use your own BugSnag API key, set the MCP_SERVER_INSIGHT_HUB_API_KEY environment variable
const McpServerBugsnagAPIKey = process.env.MCP_SERVER_INSIGHT_HUB_API_KEY;
if (McpServerBugsnagAPIKey) {
  Bugsnag.start(McpServerBugsnagAPIKey);
}

async function main() {
  console.info("Starting SmartBear MCP Server...");
  const server = new McpServer(
    {
      name: "SmartBear MCP Server",
      version: "1.0.0",
    },
    {
      capabilities: {
        resources: { listChanged: true }, // Server supports dynamic resource lists
        tools: { listChanged: true }, // Server supports dynamic tool lists
      },
    },
  );

  const reflectToken = process.env.REFLECT_API_TOKEN;
  const insightHubToken = process.env.INSIGHT_HUB_AUTH_TOKEN;
  const apiHubToken = process.env.API_HUB_API_KEY;

  if (!reflectToken && !insightHubToken && !apiHubToken) {
    console.error(
      "Please set one of REFLECT_API_TOKEN, INSIGHT_HUB_AUTH_TOKEN or API_HUB_API_KEY environment variables",
    );
    process.exit(1);
  }

  if (reflectToken) {
    const reflectClient = new ReflectClient(reflectToken);
    reflectClient.registerTools(server);
    reflectClient.registerResources(server);
    console.info("Reflect tools registered");
  }

  if (insightHubToken) {
    const insightHubClient = new InsightHubClient(insightHubToken);
    insightHubClient.registerTools(server);
    insightHubClient.registerResources(server);
    console.info("Insight Hub tools registered");
  }

  if(apiHubToken) {
    const apiHubClient = new ApiHubClient(apiHubToken);
    apiHubClient.registerTools(server);
    console.info("API Hub tools registered");
  }

  const transport = new StdioServerTransport();
  console.info("Connecting server to transport...");
  await server.connect(transport);

  console.info("SmartBear MCP Server running...");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
