import { IsBoolean, IsOptional, IsString, MinLength } from 'class-validator';


export class UpdateUserDto {
  @IsOptional()
  @IsString()
  name?: string

  @IsOptional()
  @IsString()
  phone?: string

  @IsOptional()
  @IsString()
  address?: string

  @IsOptional()
  @IsBoolean()
  active? : boolean
}
