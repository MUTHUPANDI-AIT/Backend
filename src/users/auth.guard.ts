// auth.guard.ts
import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { JWT_CONSTANTS, USER_MESSAGES } from './constants/user.constants';
import { UsersService } from './users.service';
import { Role } from './schemas/role.schema';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwtService: JwtService, private usersService: UsersService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>();
    const authHeader = req.headers['authorization'];

    // Ensure header exists and starts with 'Bearer '
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('No token provided or invalid format');
    }

    const token = authHeader.split(' ')[1];
    try {
      // Verify JWT
      const decoded = this.jwtService.verify(token, { secret: JWT_CONSTANTS.SECRET });
      
      // Check if user still exists in DB
      const user = await this.usersService.findOne(decoded.sub);
      if (!user) throw new UnauthorizedException('User no longer exists');

      // Extract role and attach user object to request for RolesGuard and Controller use
      const roleName = user.role ? (user.role as Role).name : null;
      const roleId = user._id;
      req['user'] = { _id: user._id, email: user.email, name: user.name, role: roleName , role_id : roleId };
      
      return true;
    } catch (err) {
      throw new UnauthorizedException(USER_MESSAGES.INVALID_CREDENTIALS);
    }
  }
}