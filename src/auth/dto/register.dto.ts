/* eslint-disable prettier/prettier */

import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsStrongPassword,
} from 'class-validator';

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  name!: string;
  @IsEmail()
  email!: string;
  @IsStrongPassword()
  password!: string;
}
