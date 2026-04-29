import { applyDecorators, UseGuards } from '@nestjs/common';
import { Roles } from './roles.decorator';
import { AuthGuard } from './auth.guard';
import { RolesGuard } from './roles.guard';
import { UserRole } from './schemas/user.schema';

/**
 * Core Auth Function
 * Combines AuthGuard and RolesGuard.
 * If no roles are passed, it effectively just checks the JWT.
 */
export function Auth(...roles: UserRole[]) {
  return applyDecorators(
    UseGuards(AuthGuard, RolesGuard),
    ...(roles.length ? [Roles(...roles)] : []),
  );
}

// 1. JWT Verification Only (No specific role required)
// This will verify the token and attach the user to the request.
export const AuthOnly = Auth(); 

// 2. Admin Only Access
export const AdminOnly = Auth(UserRole.ADMIN);

// 3. Example of adding new roles easily
export const StaffOnly = Auth(UserRole.ADMIN, UserRole.EMPLOYEE);