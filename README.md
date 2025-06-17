# SmartBear MCP Server

MCP Server for the SmartBear APIs.

## Supported Tools

### Reflect

The MCP server provides access to the following Reflect tools:

1. `list_reflect_suites`
   - List all Reflect suites for your account.
2. `list_reflect_suite_executions`
   - List all executions for a given Reflect suite.
3. `reflect_suite_execution_status`
   - Get the status of a Reflect suite execution.
4. `reflect_suite_execution`
   - Execute a Reflect suite.
5. `cancel_reflect_suite_execution`
   - Cancel a Reflect suite execution.
6. `list_reflect_tests`
   - List all Reflect tests.
7. `run_reflect_test`
   - Run a Reflect test.
8. `reflect_test_status`
   - Get the status of a Reflect test execution.

**Environment Variable:**
- `REFLECT_API_TOKEN`: Required. The Reflect Account API Key for Reflect-based tools.

### Insight Hub

The MCP server provides access to the following Insight Hub tools:

1. `list_insight_hub_projects`
   - List all projects in an organization.
2. `get_insight_hub_error`
   - Get error details from a project.
3. `get_insight_hub_error_latest_event`
   - Get the latest event for an error.
4. `get_insight_hub_event_details`
   - Get details of a specific event on Insight Hub.

**Environment Variable:**
- `INSIGHT_HUB_AUTH_TOKEN`: Required. The Auth Token for Insight Hub-based tools.

## Resources
### Insight Hub Resources

The MCP server exposes several Insight Hub resources that can be accessed via the Model Context Protocol:

- **insight_hub_orgs**
  - URI: `insighthub://orgs`
  - Description: Lists all organizations available to your Insight Hub account in JSON format.
  - Example usage: Retrieve a list of all organizations to get their IDs for use with other tools.

- **insight_hub_event**
  - URI Template: `insighthub://event/{id}`
  - Description: Fetches details for a specific event by its event ID. Returns the event details in JSON format.
  - Example usage: Retrieve event details for debugging or analysis by referencing the event ID.

These resources can be accessed programmatically or through compatible MCP clients, and are useful for automation, integrations, or advanced workflows.

## Usage

### MCP Inspector
To test the MCP server locally, you can use the following command:

```bash
npm run build
# For Reflect tools only:
REFLECT_API_TOKEN=your_reflect_token npx @modelcontextprotocol/inspector node dist/index.js
# For Insight Hub tools only:
INSIGHT_HUB_AUTH_TOKEN=your_insight_hub_token npx @modelcontextprotocol/inspector node dist/index.js
# For both Reflect and Insight Hub tools:
REFLECT_API_TOKEN=your_reflect_token INSIGHT_HUB_AUTH_TOKEN=your_insight_hub_token npx @modelcontextprotocol/inspector node dist/index.js
```

This will open an inspector window in your browser, where you can test the tools.

### VS Code

Add the following configuration to `.vscode/mcp.json`, depending on the type you want to use:

#### NPX

```json
{
  "inputs": [
      {
         "id": "insight_hub_auth_token",
         "type": "promptString",
         "description": "InsightHub Auth Token",
         "password": true
      },
      {
         "id": "reflect_api_token",
         "type": "promptString",
         "description": "Reflect API Token",
         "password": true
      }
  ],
  "servers": {
    "smartbear": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-smartbear"],
      "env": {
        "INSIGHT_HUB_AUTH_TOKEN": "${input:insight_hub_auth_token}",
        "REFLECT_API_TOKEN": "${input:reflect_api_token}"
      }
    }
  }
}
```

#### Docker

```json
{
  "inputs": [
      {
         "id": "insight_hub_auth_token",
         "type": "promptString",
         "description": "InsightHub Auth Token",
         "password": true
      },
      {
         "id": "reflect_api_token",
         "type": "promptString",
         "description": "Reflect API Token",
         "password": true
      }
  ],
  "servers": {
    "smartbear": {
      "type": "stdio",
      "command": "docker",
      "args": [
        "run",
        "-i",
        "--rm",
        "-e",
        "INSIGHT_HUB_AUTH_TOKEN",
        "-e",
        "REFLECT_API_TOKEN",
        "mcp/smartbear"
      ],
      "env": {
        "INSIGHT_HUB_AUTH_TOKEN": "${input:insight_hub_auth_token}",
        "REFLECT_API_TOKEN": "${input:reflect_api_token}"
      }
    }
  }
}
```

#### local

```json
{
  "inputs": [
      {
         "id": "insight_hub_auth_token",
         "type": "promptString",
         "description": "InsightHub Auth Token",
         "password": true
      },
      {
         "id": "reflect_api_token",
         "type": "promptString",
         "description": "Reflect API Token",
         "password": true
      }
  ],
  "servers": {
    "smartbear": {
      "type": "stdio",
      "command": "node",
      "args": ["${workspaceFolder}/dist/index.js"],

      "env": {
        "INSIGHT_HUB_AUTH_TOKEN": "${input:insight_hub_auth_token}",
        "REFLECT_API_TOKEN": "${input:reflect_api_token}"
      }
    }
  }
}
```

### Environment Variables

- `REFLECT_API_TOKEN`: Required for Reflect tools. The Reflect Account API Key for Reflect-based tools.
- `INSIGHT_HUB_AUTH_TOKEN`: Required for Insight Hub tools. The Auth Token for Insight Hub.
- `MCP_SERVER_INSIGHT_HUB_API_KEY`: Optional. If set, enables error reporting of the _MCP_server_ code via the BugSnag SDK. This is useful for debugging and monitoring of the MCP server itself and shouldn't be set to the same API key as your app.

## Build

Docker build:

```bash
docker build -t mcp/smartbear .
```

## License

This MCP server is licensed under the MIT License. This means you are free to use, modify, and distribute the software, subject to the terms and conditions of the MIT License. For more details, please see the LICENSE file in the project repository.
