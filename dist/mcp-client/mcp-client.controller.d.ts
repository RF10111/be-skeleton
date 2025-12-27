import { McpClientService } from './mcp-client.service';
export declare class McpClientController {
    private mcpClient;
    constructor(mcpClient: McpClientService);
    forward(body: any): Promise<any>;
}
