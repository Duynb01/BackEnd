import { IsInt, Min } from 'class-validator';

export class AddCartDto {
  @IsInt()
  productId: number;

  @IsInt()
  @Min(1)
  quantity: number;
}
