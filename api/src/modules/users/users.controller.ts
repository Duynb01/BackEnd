import { Controller, Get, Body, Patch, Param, Delete, ParseIntPipe, UseGuards, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Roles } from '../../common/roles.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../../common/roles.guard';
import { UpdatePasswordDto } from './dto/update-password.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }

  @Get('me/profile')
  @UseGuards(JwtAuthGuard)
  getProfile(@Request() request){
    return this.usersService.findOne(request.user.id)
  }

  @Patch('me/profile')
  @UseGuards(JwtAuthGuard)
  updateProfile(@Request() request, @Body() updateUserDto: UpdateUserDto){
    return this.usersService.update(request.user.id, updateUserDto)
  }

  @Patch('me/change-password')
  @UseGuards(JwtAuthGuard)
  updatePassword(@Request() request, @Body() updatePasswordDto: UpdatePasswordDto){
    return this.usersService.updatePassword(request.user.id, updatePasswordDto)
  }
}
