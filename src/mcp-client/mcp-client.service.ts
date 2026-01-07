import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class McpClientService {
  private readonly logger = new Logger(McpClientService.name);
  private mcpClientUrl: string;

  constructor(private config: ConfigService) {
    this.mcpClientUrl = this.config.get<string>('MCP_CLIENT_URL') || 'http://localhost:3001/process';
  }

  async forwardToMcp(payload: any) {
    try {
      // PERUBAHAN DI SINI:
      // Jangan ditambahin string '/mcp-client/forward' lagi.
      // Langsung pakai URL lengkap dari variable environment.
      const url = this.mcpClientUrl; 
      
      this.logger.log(`Attempting to call MCP Client at: ${url}`); // Opsional: tambah log biar jelas
      
      const resp = await axios.post(url, payload, { timeout: 15000 });
      const data = resp.data || {};
      const answer =
        data.answer ||
        data.reply ||
        data.content ||
        // some MCP responses nest payload under `result.content`
        data.result?.content ||
        data.data?.result?.content ||
        (typeof data === 'string' ? data : undefined);
      return { answer, raw: data };
    } catch (err) {
      this.logger.error(`Failed to forward to MCP client at ${this.mcpClientUrl}`, err?.message || err);
      // Fallback mock
      return { answer: `Mock reply to: ${payload.message || payload.prompt}` };
    }
}
}
