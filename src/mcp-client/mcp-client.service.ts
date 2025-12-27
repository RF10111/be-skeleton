import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class McpClientService {
  private readonly logger = new Logger(McpClientService.name);
  private mcpClientUrl: string;

  constructor(private config: ConfigService) {
    this.mcpClientUrl = this.config.get<string>('MCP_CLIENT_URL') || 'http://localhost:4001';
  }

  async forwardToMcp(payload: any) {
    try {
      const url = `${this.mcpClientUrl}/mcp-client/forward`;
      const resp = await axios.post(url, payload, { timeout: 15000 });
      return resp.data;
    } catch (err) {
      this.logger.error('Failed to forward to MCP client', err);
      return { answer: `Mock reply to: ${payload.message}` };
    }
  }
}
