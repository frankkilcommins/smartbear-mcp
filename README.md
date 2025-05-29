# SmartBear MCP Server

MCP Server for the SmartBear APIs.

## Tools

1. `echo`
   - Returns the input argument
   - Required inputs:
     - `input` (string): input param
   - Returns: Just the input param

2. `list_reflect_suites`
   - List all reflect suites of an account
   - Returns: List of all reflect suits in JSON format


### Usage

To test the MCP server locally, you can use the following command:

```bash
npm run build  
npx @modelcontextprotocol/inspector -e REFLECT_API_TOKEN=[YOUR_KEY] node dist/index.js
```
This will open an inspector window in your browser, where you can test the tools.

### Environment Variables

1. `REFLECT_API_TOKEN`: Required. The Bot User Auth Token for Reflect based tools.

## Build

Docker build:

```bash
docker build -t mcp/smartbear .
```

## License

This MCP server is licensed under the MIT License. This means you are free to use, modify, and distribute the software, subject to the terms and conditions of the MIT License. For more details, please see the LICENSE file in the project repository.