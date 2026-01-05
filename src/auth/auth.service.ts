import { Injectable, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { randomUUID } from 'crypto';

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
    const rememberToken = randomUUID();
    await this.prisma.user.update({ where: { id: user.id }, data: { rememberToken } });
    const payload = { sub: user.id, email: user.email, rt: rememberToken };
    const access_token = this.jwtService.sign(payload);
    return { access_token, rememberToken };
  }

  async logout(userId: string) {
    await this.prisma.user.update({ where: { id: userId }, data: { rememberToken: null } });
    return { status: 'ok' };
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
