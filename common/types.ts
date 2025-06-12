import { CallToolRequest, CallToolResult, Tool } from "@modelcontextprotocol/sdk/types.js";

export interface Handler {
    (request: CallToolRequest): Promise<{ content: Array<{ type: string; text: string }> }>;
}

export interface Handlers {
    [key: string]: Handler;
}

export interface ToolWithImplementation {
  tool: Tool,
  exec: (request: CallToolRequest) => Promise<CallToolResult>
}

export interface ClientWithTools {
    getTools(): ToolWithImplementation[];
}
