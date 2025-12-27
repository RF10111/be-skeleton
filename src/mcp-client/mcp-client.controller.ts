import { Body, Controller, Post } from '@nestjs/common';
import { McpClientService } from './mcp-client.service';

@Controller('mcp-client')
export class McpClientController {
  constructor(private mcpClient: McpClientService) {}

  @Post('forward')
  async forward(@Body() body: any) {
    // In production this controller would forward to a separate MCP server endpoint
    // Here we forward to a configured MCP server (e.g., remote) or, if running locally,
    // our local MCP server at /mcp-server/process
    const target = (body._targetUrl as string) || 'http://localhost:4002/mcp-server/process';
    // If the configured MCP client url points to this app itself, call the local server
    // For simplicity, just simulate a forward by making an HTTP call
    try {
      // simple simulation: call target via axios
      const axios = require('axios');
      const resp = await axios.post(target, body);
      return resp.data;
    } catch (err) {
      // fallback mock
      return { answer: `mcp-client mock -> ${body.message}` };
    }
  }
}
