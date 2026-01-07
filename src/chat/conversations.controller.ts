import { Controller, Get, UseGuards, Request, Query, Param, NotFoundException, ForbiddenException } from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('conversations')
export class ConversationsController {
  constructor(private chatService: ChatService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async list(@Request() req, @Query('page') page?: string, @Query('limit') limit?: string) {
    const user = req.user;
    const pageNum = page ? parseInt(page, 10) || 1 : 1;
    const limitNum = limit ? parseInt(limit, 10) || 20 : 20;

    const data = await this.chatService.getConversations(user.id, pageNum, limitNum);
    return { statusCode: 200, ...data };
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/messages')
  async messages(
    @Request() req,
    @Param('id') conversationId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('cursor') cursor?: string,
  ) {
    const user = req.user;
    const limitNum = limit ? parseInt(limit, 10) || 20 : 20;

    // If `cursor` provided, use cursor-based pagination (recommended for chat streams)
    if (cursor) {
      const data = await this.chatService.getConversationMessagesCursor(user.id, conversationId, cursor, limitNum);
      if (!data) {
        const conv = await this.chatService['prisma'].conversation.findUnique({ where: { id: conversationId } });
        if (!conv) throw new NotFoundException('Conversation not found');
        throw new ForbiddenException('Not authorized to access this conversation');
      }

      return { statusCode: 200, ...data };
    }

    // fallback to page-based when cursor not provided
    const pageNum = page ? parseInt(page, 10) || 1 : 1;
    const data = await this.chatService.getConversationMessages(user.id, conversationId, pageNum, limitNum);
    if (!data) {
      const conv = await this.chatService['prisma'].conversation.findUnique({ where: { id: conversationId } });
      if (!conv) throw new NotFoundException('Conversation not found');
      throw new ForbiddenException('Not authorized to access this conversation');
    }

    return { statusCode: 200, ...data };
  }
}
