import { IsBoolean, IsOptional, IsString } from 'class-validator';


export class UpdateProductDto {
  @IsOptional()
  @IsString()
  price?: string

  @IsOptional()
  @IsString()
  stock?: string

  @IsOptional()
  @IsBoolean()
  active? : boolean
}
