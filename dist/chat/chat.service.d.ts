import { PrismaService } from '../prisma/prisma.service';
import { McpClientService } from '../mcp-client/mcp-client.service';
export declare class ChatService {
    private prisma;
    private mcpClient;
    constructor(prisma: PrismaService, mcpClient: McpClientService);
    createConversation(userId: string, title?: string): Promise<{
        id: string;
        title: string | null;
        createdAt: Date;
        userId: string;
    }>;
    addMessage(conversationId: string, role: string, content: string, metadata?: any): Promise<{
        id: string;
        createdAt: Date;
        role: string;
        content: string;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        conversationId: string;
    }>;
    sendPrompt(userId: string, conversationId: string, prompt: string): Promise<{
        user: {
            id: string;
            content: string;
            createdAt: Date;
        };
        assistant: {
            answer: string;
            createdAt: Date;
        };
    }>;
    getConversation(conversationId: string, userId: string): Promise<{
        createdAt: Date;
        role: string;
        content: string;
    }[]>;
}
