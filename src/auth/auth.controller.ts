import { Body, Controller, Post, UseGuards, Request, HttpCode, HttpStatus, BadRequestException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() body: RegisterDto) {
    if (!body || !body.email || !body.password) {
      throw new BadRequestException('email and password are required');
    }
    return this.authService.register(body);
  }

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() body: LoginDto) {
    const user = await this.authService.validateUser(body.email, body.password);
    if (!user) return { status: 'error', message: 'Invalid credentials' };
    return this.authService.login(user);
  }

  @UseGuards(JwtAuthGuard)
  @Post('me')
  me(@Request() req) {
    return req.user;
  }
}
