import { Controller, Post, Body, Get } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { AuthOnly } from './auth.decorator';
import { GetUser } from './get-user.decorator';
import { IUserPayload } from './interfaces/user.interface';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('register')
  async register(@Body() dto: CreateUserDto) {
    return this.usersService.register(dto);
  }

  @Post('login')
  async login(@Body() dto: LoginUserDto) {
    return this.usersService.login(dto);
  }

  @Get('profile')
  @AuthOnly
  getProfile(@GetUser() user: IUserPayload) {
    return {
      id: user._id,
      name: user.name,
      email: user.email,
    };
  }
}
