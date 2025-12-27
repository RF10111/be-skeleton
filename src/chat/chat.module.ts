import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { McpClientModule } from '../mcp-client/mcp-client.module';

@Module({
  imports: [PrismaModule, McpClientModule],
  providers: [ChatService],
  controllers: [ChatController],
})
export class ChatModule {}
