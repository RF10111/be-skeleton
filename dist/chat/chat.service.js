"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const mcp_client_service_1 = require("../mcp-client/mcp-client.service");
let ChatService = class ChatService {
    constructor(prisma, mcpClient) {
        this.prisma = prisma;
        this.mcpClient = mcpClient;
    }
    async createConversation(userId, title) {
        return this.prisma.conversation.create({ data: { userId, title } });
    }
    async addMessage(conversationId, role, content, metadata) {
        const safeContent = typeof content === 'string' ? content : content == null ? '' : String(content);
        return this.prisma.message.create({
            data: { conversationId, role, content: safeContent, metadata },
        });
    }
    async sendPrompt(userId, conversationId, prompt) {
        const userMsg = await this.addMessage(conversationId, 'user', prompt);
        const mcpResponse = await this.mcpClient.forwardToMcp({
            userId,
            conversationId,
            message: prompt,
        });
        const assistantMsg = await this.addMessage(conversationId, 'assistant', mcpResponse.answer || '', { source: 'mcp-client' });
        return {
            user: { id: userMsg.id, content: userMsg.content, createdAt: userMsg.createdAt },
            assistant: { answer: assistantMsg.content, createdAt: assistantMsg.createdAt },
        };
    }
    async getConversation(conversationId, userId) {
        const conv = await this.prisma.conversation.findUnique({ where: { id: conversationId }, select: { id: true, userId: true } });
        if (!conv || conv.userId !== userId)
            return null;
        const messages = await this.prisma.message.findMany({ where: { conversationId }, orderBy: { createdAt: 'asc' }, select: { role: true, content: true, createdAt: true } });
        return messages;
    }
};
exports.ChatService = ChatService;
exports.ChatService = ChatService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService, mcp_client_service_1.McpClientService])
], ChatService);
