import { Body, Controller, Post, UseGuards, Request, Param } from '@nestjs/common';
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

@Controller('chat')
export class ChatController {
  constructor(private chatService: ChatService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async prompt(@Request() req, @Body() body: PromptDto) {
    const user = req.user;
    let conversationId = body.conversationId;
    if (!conversationId) {
      const conv = await this.chatService.createConversation(user.id, 'Conversation');
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
}
