import {
  Body,
  Controller,
  Post,
  UseGuards,
  Request,
  Param,
  Get,
  NotFoundException,
  ForbiddenException,
  Patch,
  Delete,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

class PromptDto {
  @IsOptional()
  @IsString()
  conversationId?: string;

  @IsNotEmpty() // Wajib isi
  @IsString()   // Harus berupa string
  prompt: string;
}

class PromptBodyDto {
  @IsNotEmpty()
  @IsString()
  prompt: string;
}

class TitleDto {
  @IsNotEmpty()
  @IsString()
  title: string;
}

@Controller('chat')
export class ChatController {
  constructor(private chatService: ChatService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async prompt(@Request() req, @Body() body: PromptDto) {
    const user = req.user;
    let conversationId = body.conversationId;
    if (!conversationId) {
      const conv = await this.chatService.createConversationForPrompt(user.id, body.prompt);
      conversationId = conv.id;
    }
    const result = await this.chatService.sendPrompt(user.id, conversationId, body.prompt);
    return { statusCode: 200, result };
  }

  @UseGuards(JwtAuthGuard)
  @Post(':conversationId')
  async promptWithId(
    @Request() req,
    @Param('conversationId') conversationId: string,
    @Body() body: PromptBodyDto,
  ) {
    const user = req.user;
    const result = await this.chatService.sendPrompt(user.id, conversationId, body.prompt);
    return { statusCode: 200, result };
  }

  @UseGuards(JwtAuthGuard)
  @Get(':conversationId')
  async getHistory(@Request() req, @Param('conversationId') conversationId: string) {
    const user = req.user;
    const data = await this.chatService.getConversationHistory(user.id, conversationId);
    if (!data) {
      // determine whether conversation exists
      // return 404 if not found, 403 if found but not owned
      const conv = await this.chatService['prisma'].conversation.findUnique({ where: { id: conversationId } });
      if (!conv) throw new NotFoundException('Conversation not found');
      throw new ForbiddenException('Not authorized to access this conversation');
    }

    return { statusCode: 200, ...data };
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async getUserHistory(@Request() req) {
    const user = req.user;
    const conversations = await this.chatService.getUserHistory(user.id);
    return { statusCode: 200, conversations };
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':conversationId/title')
  async updateTitle(@Request() req, @Param('conversationId') conversationId: string, @Body() body: TitleDto) {
    const user = req.user;
    const updated = await this.chatService.updateConversationTitle(user.id, conversationId, body.title);
    if (!updated) {
      const conv = await this.chatService['prisma'].conversation.findUnique({ where: { id: conversationId } });
      if (!conv) throw new NotFoundException('Conversation not found');
      throw new ForbiddenException('Not authorized to edit this conversation');
    }

    return { statusCode: 200, conversation: updated };
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':conversationId')
  async deleteConversation(@Request() req, @Param('conversationId') conversationId: string) {
    const user = req.user;
    const deleted = await this.chatService.deleteConversation(user.id, conversationId);
    if (!deleted) {
      const conv = await this.chatService['prisma'].conversation.findUnique({ where: { id: conversationId } });
      if (!conv) throw new NotFoundException('Conversation not found');
      throw new ForbiddenException('Not authorized to delete this conversation');
    }

    return { statusCode: 200, conversation: deleted };
  }
}
