import { PrismaService } from '../prisma/prisma.service';
export declare class McpServerController {
    private prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    process(body: any): Promise<{
        answer: string;
    }>;
}
