import { IsNotEmpty, IsEmail, Length, Matches } from 'class-validator';

export class SignUpDto {
  @IsNotEmpty()
  fullname: string;

  @IsNotEmpty()
  username: string;

  @IsEmail()
  email: string;

  @Matches(/^\d{10}$/)
  phone: string;

  @Length(6)
  password: string;
}
