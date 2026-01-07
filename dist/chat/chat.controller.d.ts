import { ChatService } from './chat.service';
declare class PromptDto {
    conversationId?: string;
    prompt: string;
}
declare class PromptBodyDto {
    prompt: string;
}
export declare class ChatController {
    private chatService;
    constructor(chatService: ChatService);
    prompt(req: any, body: PromptDto): Promise<{
<<<<<<< HEAD
        conversationId: string;
        result: {
            user: {
                id: string;
                createdAt: Date;
                role: string;
                content: string;
                metadata: import("@prisma/client/runtime/library").JsonValue | null;
                conversationId: string;
            };
            assistant: {
                answer: any;
                raw: any;
            } | {
                answer: string;
                raw?: undefined;
=======
        statusCode: number;
        result: {
            user: {
                id: string;
                role: string;
                content: string;
                metadata: import("@prisma/client/runtime/library").JsonValue | null;
                createdAt: Date;
                conversationId: string;
            };
            assistant: {
                id: string;
                role: string;
                content: string;
                metadata: import("@prisma/client/runtime/library").JsonValue | null;
                createdAt: Date;
                conversationId: string;
            };
        };
    }>;
    promptWithId(req: any, conversationId: string, body: PromptBodyDto): Promise<{
        statusCode: number;
        result: {
            user: {
                id: string;
                role: string;
                content: string;
                metadata: import("@prisma/client/runtime/library").JsonValue | null;
                createdAt: Date;
                conversationId: string;
            };
            assistant: {
                id: string;
                role: string;
                content: string;
                metadata: import("@prisma/client/runtime/library").JsonValue | null;
                createdAt: Date;
                conversationId: string;
>>>>>>> 61173fa8b054bd60235c7436396e55a20a026264
            };
        };
    }>;
}
export {};
