import { Module } from '@nestjs/common';
import { McpServerController } from './mcp-server.controller';

@Module({
  controllers: [McpServerController],
})
export class McpServerModule {}
