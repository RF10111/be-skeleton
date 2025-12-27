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
Object.defineProperty(exports, "__esModule", { value: true });
exports.McpClientController = void 0;
const common_1 = require("@nestjs/common");
const mcp_client_service_1 = require("./mcp-client.service");
let McpClientController = class McpClientController {
    constructor(mcpClient) {
        this.mcpClient = mcpClient;
    }
    async forward(body) {
        const target = body._targetUrl || 'http://localhost:4002/mcp-server/process';
        try {
            const axios = require('axios');
            const resp = await axios.post(target, body);
            return resp.data;
        }
        catch (err) {
            return { answer: `mcp-client mock -> ${body.message}` };
        }
    }
};
exports.McpClientController = McpClientController;
__decorate([
    (0, common_1.Post)('forward'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], McpClientController.prototype, "forward", null);
exports.McpClientController = McpClientController = __decorate([
    (0, common_1.Controller)('mcp-client'),
    __metadata("design:paramtypes", [mcp_client_service_1.McpClientService])
], McpClientController);
