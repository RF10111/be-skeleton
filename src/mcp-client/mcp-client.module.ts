import { Module } from '@nestjs/common';
import { McpClientController } from './mcp-client.controller';
import { McpClientService } from './mcp-client.service';
@Module({
  imports: [],
  controllers: [McpClientController],
  providers: [McpClientService],
  exports: [McpClientService],
})
export class McpClientModule {}
