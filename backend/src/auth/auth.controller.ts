import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService, private usersService: UsersService) {}

  @Post('login')
  async login(@Body() body: { email: string; password: string }) {
    const user = await this.authService.validateUser(body.email, body.password);
    return this.authService.login(user);
  }

  @Post('register')
  async register(@Body() body: { name: string; email: string; password: string }) {
    const existing = await this.usersService.findByEmail(body.email);
    if (existing) throw new BadRequestException('Email already in use');
    const user = await this.usersService.create(body.name, body.email, body.password);
    const { password, ...u } = user as any;
    return this.authService.login(u);
  }
}
