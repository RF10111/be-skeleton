import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class McpClientService {
  private readonly logger = new Logger(McpClientService.name);
  private mcpClientUrl: string;

  constructor(private config: ConfigService) {
    this.mcpClientUrl = this.config.get<string>('MCP_CLIENT_URL');
  }

  async forwardToMcp(payload: any) {
    try {
      // PERUBAHAN DI SINI:
      // Jangan ditambahin string '/mcp-client/forward' lagi.
      // Langsung pakai URL lengkap dari variable environment.
      const url = this.mcpClientUrl; 
      
      this.logger.log(`Attempting to call MCP Client at: ${url}`); // Opsional: tambah log biar jelas
      
      const resp = await axios.post(url, payload, { timeout: 15000 });
      return resp.data;
    } catch (err) {
      this.logger.error(`Failed to forward to MCP client at ${this.mcpClientUrl}`, err.message);
      // Fallback mock
      return { answer: `Mock reply to: ${payload.message || payload.prompt}` };
    }
}
}
