import { CallToolRequest } from "@modelcontextprotocol/sdk/types.js";

export interface Handler {
    (request: CallToolRequest): Promise<{ content: Array<{ type: string; text: string }> }>;
}

export interface Handlers {
    [key: string]: Handler;
}

export interface ClientWithHandlers {
    getHandlers(): Handlers;
}
