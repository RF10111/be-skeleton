import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { McpClientService } from '../mcp-client/mcp-client.service';

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService, private mcpClient: McpClientService) {}

  async createConversation(userId: string, title?: string) {
    return this.prisma.conversation.create({ data: { userId, title } });
  }

  async addMessage(conversationId: string, role: string, content: string, metadata?: any) {
    const safeContent = typeof content === 'string' ? content : content == null ? '' : String(content);
    return this.prisma.message.create({
      data: { conversationId, role, content: safeContent, metadata },
    });
  }

  async sendPrompt(userId: string, conversationId: string, prompt: string) {
    // save user message
    const userMsg = await this.addMessage(conversationId, 'user', prompt);

    // forward to MCP client (which forwards to MCP server)
    const mcpResponse = await this.mcpClient.forwardToMcp({
      userId,
      conversationId,
      message: prompt,
    });

    // determine assistant content (support nested shapes)
    const assistantContent =
      mcpResponse?.answer ?? mcpResponse?.raw?.result?.content ?? mcpResponse?.raw?.data?.result?.content ?? '';

    // save assistant message; do NOT include metadata (store as null)
    const assistantMsg = await this.addMessage(conversationId, 'assistant', assistantContent);

    // return user and saved assistant message (contains id, createdAt, role, content, conversationId)
    return { user: userMsg, assistant: assistantMsg };
  }
}
