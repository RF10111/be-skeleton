import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
export declare class AuthService {
    private prisma;
    private jwtService;
    constructor(prisma: PrismaService, jwtService: JwtService);
    validateUser(email: string, pass: string): Promise<any>;
    login(user: any): Promise<{
        access_token: string;
        rememberToken: `${string}-${string}-${string}-${string}-${string}`;
    }>;
    logout(userId: string): Promise<{
        status: string;
    }>;
    register(data: {
        email: string;
        password: string;
        name?: string;
    }): Promise<any>;
}
