import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { ChatModule } from './chat/chat.module';
// Using axios directly in MCP client; no HttpModule needed
import { McpClientModule } from './mcp-client/mcp-client.module';
import { McpServerModule } from './mcp-server/mcp-server.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    ChatModule,
    McpClientModule,
    McpServerModule,
  ],
})
export class AppModule {}
