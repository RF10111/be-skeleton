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
var McpClientService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.McpClientService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("axios");
const config_1 = require("@nestjs/config");
let McpClientService = McpClientService_1 = class McpClientService {
    constructor(config) {
        this.config = config;
        this.logger = new common_1.Logger(McpClientService_1.name);
        this.mcpClientUrl = this.config.get('MCP_CLIENT_URL') || 'http://localhost:3001/process';
    }
    async forwardToMcp(payload) {
        try {
            const url = this.mcpClientUrl;
            this.logger.log(`Attempting to call MCP Client at: ${url}`);
            const resp = await axios_1.default.post(url, payload, { timeout: 15000 });
            const data = resp.data || {};
            const answer = data.answer ||
                data.reply ||
                data.content ||
                data.result?.content ||
                data.data?.result?.content ||
                (typeof data === 'string' ? data : undefined);
            return { answer, raw: data };
        }
        catch (err) {
            this.logger.error(`Failed to forward to MCP client at ${this.mcpClientUrl}`, err?.message || err);
            return { answer: `Mock reply to: ${payload.message || payload.prompt}` };
        }
    }
};
exports.McpClientService = McpClientService;
exports.McpClientService = McpClientService = McpClientService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], McpClientService);
