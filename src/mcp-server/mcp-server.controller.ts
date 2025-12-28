import { Body, Controller, Post, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller('mcp-server')
export class McpServerController {
  private readonly logger = new Logger(McpServerController.name);
  constructor(private prisma: PrismaService) {}

  @Post('process')
  async process(@Body() body: any) {
    // Simulate LLM processing and persist assistant reply to DB if conversationId provided
    const prompt = body.message || body.prompt || '';
    const answer = `LLM reply (simulated) to: ${prompt}`;

    try {
      // If a conversationId is provided, save the assistant message
      if (body.conversationId) {
        await this.prisma.message.create({
          data: {
            conversationId: body.conversationId,
            role: 'assistant',
            content: answer,
            metadata: body.metadata || null,
          },
        });
        this.logger.log(`Saved assistant message to conversation ${body.conversationId}`);
      }
    } catch (err) {
      this.logger.error('Failed to save assistant message', err?.message || err);
    }

    return { answer };
  }
}
