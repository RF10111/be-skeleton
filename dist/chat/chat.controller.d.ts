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
        user: {
            id: any;
            content: string;
        };
        assistant: {
            answer: string;
            createdAt: Date;
        };
    }>;
    getConversation(req: any, conversationId: string, userId: string): Promise<{
        error: string;
        conversationId?: undefined;
        userId?: undefined;
        messages?: undefined;
    } | {
        conversationId: string;
        userId: string;
        messages: {
            role: string;
            content: string;
            createdAt: Date;
        }[];
        error?: undefined;
    }>;
}
export {};
