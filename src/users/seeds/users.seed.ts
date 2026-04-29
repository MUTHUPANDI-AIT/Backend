import { UserRole } from '../schemas/user.schema';
import * as bcrypt from 'bcryptjs';

export const usersSeed = [
  {
    email: 'admin@example.com',
    password: bcrypt.hashSync('admin123', 10),
    name: 'Admin User',
    role: UserRole.ADMIN,
    isActive: true,
  },
  {
    email: 'user@example.com',
    password: bcrypt.hashSync('user123', 10),
    name: 'Normal User',
    role: UserRole.USER,
    isActive: true,
  },
];
