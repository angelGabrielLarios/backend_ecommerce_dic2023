import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';


@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Get('email/:email')
  async findOneByEmail(@Param('email') email: string) {
    return await this.usersService.findOneByEmail(email)
  }

  @Post()
  async save(@Body() createUserDto: CreateUserDto) {

    return await this.usersService.save(createUserDto)
  }

}