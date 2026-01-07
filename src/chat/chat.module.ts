import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { ConversationsController } from './conversations.controller';
import { PrismaModule } from '../database/database.module';
import { McpClientModule } from '../mcp-client/mcp-client.module';

@Module({
  imports: [PrismaModule, McpClientModule],
  providers: [ChatService],
  controllers: [ChatController, ConversationsController],
})
export class ChatModule {}
