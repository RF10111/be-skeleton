import { ConfigService } from '@nestjs/config';
export declare class McpClientService {
    private config;
    private readonly logger;
    private mcpClientUrl;
    constructor(config: ConfigService);
    forwardToMcp(payload: any): Promise<any>;
}
