import {
  IsEmail,
  Matches,
  IsString,
  IsOptional,
  IsEnum,
  IsNotEmpty,
  MinLength,
} from 'class-validator';
import { UserRole } from '../schemas/user.schema';

export class CreateUserDto {
  @IsNotEmpty()
  @IsEmail()
  @Matches(/^[a-zA-Z0-9._%+-]+@(gmail\.com|yahoo\.com)$/, {
    message: 'Email format is invalid',
  })
  readonly email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  readonly password: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  readonly name: string;

  @IsOptional()
  @IsEnum(UserRole)
  readonly role?: UserRole;
}
