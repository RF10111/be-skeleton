import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    register(body: RegisterDto): Promise<any>;
    login(body: LoginDto): Promise<{
        access_token: string;
        rememberToken: `${string}-${string}-${string}-${string}-${string}`;
    } | {
        status: string;
        message: string;
    }>;
    me(req: any): any;
    logout(req: any): Promise<{
        status: string;
    }>;
}
