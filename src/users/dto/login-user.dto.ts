import { IsEmail, IsString, IsNotEmpty, MinLength } from 'class-validator';

export class LoginUserDto {
  @IsNotEmpty()
  @IsEmail()
  // @Matches(/^[a-zA-Z0-9._%+-]+@(gmail\.com|yahoo\.com)$/, {
  //   message: 'Email format is invalid',
  // })
  readonly email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  readonly password: string;
}
