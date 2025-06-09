import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginDto {
    @IsEmail({}, { message: 'Email không hợp lệ' })
    email: string;
    
    @IsNotEmpty({ message: 'Mật khẩu không được để trống' })
    @MinLength(6, {message: 'Mật khẩu phải lớn hơn 6 ký tự!'})
    password: string;
}