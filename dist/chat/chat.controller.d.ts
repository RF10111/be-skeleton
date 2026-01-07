import { ChatService } from './chat.service';
declare class PromptDto {
    conversationId?: string;
    prompt: string;
}
export declare class ChatController {
    private chatService;
    constructor(chatService: ChatService);
    prompt(req: any, body: PromptDto): Promise<{
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
            };
        };
    }>;
}
export {};
