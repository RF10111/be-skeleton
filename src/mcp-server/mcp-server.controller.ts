import { Body, Controller, Post } from '@nestjs/common';

@Controller('mcp-server')
export class McpServerController {
  @Post('process')
  async process(@Body() body: any) {
    // This simulates the MCP server which would call LLM and return an answer.
    // In production this would call your LLM or other AI infra.
    const prompt = body.message || body.prompt || '';
    // For demo, just echo with a prefix
    const answer = `LLM reply (simulated) to: ${prompt}`;
    return { answer };
  }
}
