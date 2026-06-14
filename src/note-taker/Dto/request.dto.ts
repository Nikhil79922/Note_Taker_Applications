import { IsEmail, IsNumber } from 'class-validator';

export class RequestDto {
  @IsNumber()
  sub!: number;
  @IsEmail()
  email!: string;
}
