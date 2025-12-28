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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var McpServerController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.McpServerController = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let McpServerController = McpServerController_1 = class McpServerController {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(McpServerController_1.name);
    }
    async process(body) {
        const conversationId = body.conversationId || null;
        const assistantContent = body.answer || body.reply || body.content || null;
        if (!conversationId || !assistantContent) {
            this.logger.warn('MCP webhook missing conversationId or content');
            return { ok: false, reason: 'missing_conversationId_or_content' };
        }
        try {
            const assistantMsg = await this.prisma.message.create({
                data: {
                    conversationId,
                    role: 'assistant',
                    content: assistantContent,
                    metadata: body.metadata || null,
                },
            });
            this.logger.log(`Saved assistant message for conversation ${conversationId}`);
            return { ok: true, assistant: { answer: assistantMsg.content, createdAt: assistantMsg.createdAt } };
        }
        catch (err) {
            this.logger.error('Failed to save assistant message', err?.message || err);
            return { ok: false, reason: 'internal_error' };
        }
    }
};
exports.McpServerController = McpServerController;
__decorate([
    (0, common_1.Post)('process'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], McpServerController.prototype, "process", null);
exports.McpServerController = McpServerController = McpServerController_1 = __decorate([
    (0, common_1.Controller)('mcp-server'),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], McpServerController);
