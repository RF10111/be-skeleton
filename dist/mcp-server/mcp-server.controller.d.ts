import { PrismaService } from '../prisma/prisma.service';
export declare class McpServerController {
    private prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    process(body: any): Promise<{
        ok: boolean;
        reason: string;
        assistant?: undefined;
    } | {
        ok: boolean;
        assistant: {
            answer: string;
            createdAt: Date;
        };
        reason?: undefined;
    }>;
}
