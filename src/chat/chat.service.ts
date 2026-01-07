import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/database.service';
import { McpClientService } from '../mcp-client/mcp-client.service';

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService, private mcpClient: McpClientService) {}

  async createConversation(userId: string, title?: string) {
    return this.prisma.conversation.create({ data: { userId, title } });
  }

  // Create conversation deriving a short title from the first prompt if no title provided
  async createConversationForPrompt(userId: string, prompt: string) {
    const title = this.generateTitle(prompt);
    return this.createConversation(userId, title);
  }

  // Generate a compact title (max 3 words) representing the prompt's theme
  private generateTitle(prompt: string) {
    if (!prompt) return 'Conversation';

    // normalize and remove punctuation
    const cleaned = prompt
      .replace(/[\n\r]/g, ' ')
      .replace(/[`"'“”«»()\[\]{}<>:;,.!?\/\\@#%&=*+~^|<>\-]/g, ' ')
      .toLowerCase()
      .trim();

    const stopwords = new Set([
      'the','a','an','and','or','but','if','of','to','in','on','for','with','is','are','was','were','be','by','it','this','that','these','those','as','at','from','about','into','through','during','before','after','above','below','so','too','very'
    ]);

    const words = cleaned
      .split(/\s+/)
      .filter(w => w.length > 2 && !stopwords.has(w));

    const picked = (words.length ? words : cleaned.split(/\s+/)).slice(0, 3);

    // Capitalize words for nicer title
    const title = picked
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');

    return title || 'Conversation';
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

  async getConversationHistory(userId: string, conversationId: string) {
    const conv = await this.prisma.conversation.findUnique({ where: { id: conversationId } });
    if (!conv) return null;
    if (conv.userId !== userId) return null;

    const messages = await this.prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
    });

    return { conversation: conv, messages };
  }

  // return all conversations for a user including their messages (ordered by createdAt)
  async getUserHistory(userId: string) {
    const conversations = await this.prisma.conversation.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      // include: { messages: { orderBy: { createdAt: 'asc' } } },
    });

    return conversations;
  }

  // paginated list of conversations for a user (page-based)
  async getConversations(userId: string, page = 1, limit = 20) {
    const take = Math.min(Math.max(1, limit ?? 20), 100);
    const pageNum = Math.max(1, page ?? 1);
    const skip = (pageNum - 1) * take;

    const [items, total] = await Promise.all([
      this.prisma.conversation.findMany({
        where: { userId },
        orderBy: { createdAt: 'asc' },
        skip,
        take,
      }),
      this.prisma.conversation.count({ where: { userId } }),
    ]);

    return {
      items,
      meta: { total, page: pageNum, limit: take, totalPages: Math.ceil(total / take) },
    };
  }

  // paginated messages for a conversation (page-based). returns null if not found or not owned
  async getConversationMessages(userId: string, conversationId: string, page = 1, limit = 20) {
    const conv = await this.prisma.conversation.findUnique({ where: { id: conversationId } });
    if (!conv) return null;
    if (conv.userId !== userId) return null;

    const take = Math.min(Math.max(1, limit ?? 20), 100);
    const pageNum = Math.max(1, page ?? 1);
    const skip = (pageNum - 1) * take;

    const [messages, total] = await Promise.all([
      this.prisma.message.findMany({ where: { conversationId }, orderBy: { createdAt: 'asc' }, skip, take }),
      this.prisma.message.count({ where: { conversationId } }),
    ]);

    return {
      conversation: conv,
      messages,
      meta: { total, page: pageNum, limit: take, totalPages: Math.ceil(total / take) },
    };
  }

  // cursor-based pagination for messages (stable for append)
  async getConversationMessagesCursor(
    userId: string,
    conversationId: string,
    cursor?: string,
    limit = 20,
  ) {
    const conv = await this.prisma.conversation.findUnique({ where: { id: conversationId } });
    if (!conv) return null;
    if (conv.userId !== userId) return null;

    const take = Math.min(Math.max(1, limit ?? 20), 100);

    const findArgs: any = {
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
      take: take + 1, // fetch one extra to detect next cursor
    };

    if (cursor) {
      findArgs.cursor = { id: cursor };
      findArgs.skip = 1; // skip the cursor itself
    }

    const rows = await this.prisma.message.findMany(findArgs);
    const hasNext = rows.length > take;
    const items = hasNext ? rows.slice(0, take) : rows;
    const nextCursor = hasNext && items.length ? items[items.length - 1].id : null;

    return {
      conversation: conv,
      messages: items,
      meta: { limit: take, nextCursor },
    };
  }

  // update conversation title if owned by user; returns updated conversation or null
  async updateConversationTitle(userId: string, conversationId: string, title: string) {
    const conv = await this.prisma.conversation.findUnique({ where: { id: conversationId } });
    if (!conv) return null;
    if (conv.userId !== userId) return null;

    const updated = await this.prisma.conversation.update({
      where: { id: conversationId },
      data: { title },
    });

    return updated;
  }

  // Delete a conversation and its messages if owned by the user. Returns deleted conversation or null.
  async deleteConversation(userId: string, conversationId: string) {
    const conv = await this.prisma.conversation.findUnique({ where: { id: conversationId } });
    if (!conv) return null;
    if (conv.userId !== userId) return null;

    // Remove messages first to avoid FK constraint issues if the DB doesn't cascade
    await this.prisma.message.deleteMany({ where: { conversationId } });

    const deleted = await this.prisma.conversation.delete({ where: { id: conversationId } });
    return deleted;
  }
}
