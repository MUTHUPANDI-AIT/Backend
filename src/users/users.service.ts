import {
  Injectable,
  BadRequestException,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument, UserRole } from './schemas/user.schema';
import { Role } from './schemas/role.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import * as bcrypt from 'bcryptjs';
import { USER_MESSAGES } from './constants/user.constants';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Role.name) private roleModel: Model<Role>,
    private jwtService: JwtService,
  ) {}

  async register(dto: CreateUserDto) {
    // 1. Check if user exists
    const existing = await this.userModel.findOne({ email: dto.email });
    if (existing) {
      throw new ConflictException(USER_MESSAGES.USER_EXISTS);
    }

    // 2. Check if roles exist in DB
    const rolesCount = await this.roleModel.countDocuments();
    let roleDoc = null;
    let roleName = null;

    if (rolesCount > 0) {
      // Default to 'user' role automatically
      const defaultRole = UserRole.USER;
      roleDoc = await this.roleModel.findOne({ name: defaultRole });
      if (!roleDoc) {
        throw new BadRequestException(
          `Default role '${defaultRole}' not found in database.`,
        );
      }
      roleName = roleDoc.name;
    }

    // 3. Hash password and save user
    const hash = await bcrypt.hash(dto.password, 10);
    const user = await this.userModel.create({
      ...dto,
      password: hash,
      role: roleDoc ? roleDoc._id : undefined,
    });

    // 4. Sign token
    const token = this.jwtService.sign({
      sub: user._id,
      role: roleName,
      email: user.email,
      name: user.name,
    });

    return {
      message: USER_MESSAGES.REGISTER_SUCCESS,
      token,
      role: roleName,
      name: user.name,
      userId: user._id,
    };
  }

  async login(dto: LoginUserDto) {
    // 1. Find user and POPULATE role to get the role name
    const user = await this.userModel
      .findOne({ email: dto.email })
      .populate('role');

    if (!user) {
      throw new UnauthorizedException(USER_MESSAGES.USER_NOT_FOUND);
    }

    // 2. Verify password
    const isMatch = await bcrypt.compare(dto.password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException(USER_MESSAGES.INVALID_CREDENTIALS);
    }

    // 3. Extract role name for the JWT payload (null if no role)
    const roleName =
      typeof user.role === 'object' && user.role !== null && 'name' in user.role
        ? (user.role as Role).name
        : null;
    //   const roleId =
    // user.role && typeof user.role === 'object'
    //   ? (user.role as Role)._id
    //   : user.role;

    // 4. Sign token so Guards can verify it
    const token = this.jwtService.sign({
      sub: user._id,
      role: roleName,
      email: user.email,
      name: user.name,
      // roleid: roleId,
    });

    return {
      message: USER_MESSAGES.LOGIN_SUCCESS,
      token,
      role: roleName,
      name: user.name,
      userId: user._id,
    };
  }

  async findOne(id: string) {
    return this.userModel.findById(id).populate('role');
  }
}
