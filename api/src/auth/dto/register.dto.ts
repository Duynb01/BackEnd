import { LoginDto } from './login.dto';
import { IsPhoneNumber, IsString } from 'class-validator';

export class RegisterDto extends LoginDto {
  @IsString()
  name: string;
}
