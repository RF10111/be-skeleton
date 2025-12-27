import { Injectable, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private jwtService: JwtService) {}

  async validateUser(email: string, pass: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) return null;
    const match = await bcrypt.compare(pass, user.password);
    if (match) {
      const { password, ...res } = user as any;
      return res;
    }
    return null;
  }

  async login(user: any) {
    const payload = { sub: user.id, email: user.email };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async register(data: { email: string; password: string; name?: string }) {
    if (!data || !data.email || !data.password) {
      throw new BadRequestException('email and password are required');
    }
    const hashed = await bcrypt.hash(String(data.password), 10);
    const user = await this.prisma.user.create({
      data: { email: data.email, password: hashed, name: data.name },
    });
    const { password, ...rest } = user as any;
    return rest;
  }
}
