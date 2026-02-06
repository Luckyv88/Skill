import { IsNotEmpty, IsEmail } from 'class-validator';

export class loginDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  password: string;
}
