import { IsBoolean, IsInt, IsOptional } from 'class-validator';


export class UpdateStatusRoleDto {
  @IsOptional()
  @IsInt()
  roleId?: number

  @IsOptional()
  @IsBoolean()
  active? : boolean
}
