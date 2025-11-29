import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PecersService } from './pecers.service';
import { CreatePecerDto } from './dto/create-pecer.dto';
import { UpdatePecerDto } from './dto/update-pecer.dto';

@Controller('pecers')
export class PecersController {
  constructor(private readonly pecersService: PecersService) {}

  @Post('create')
  create(@Body() createPecerDto: CreatePecerDto) {
    return this.pecersService.create(createPecerDto);
  }

  @Get()
  findAll() {
    return this.pecersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.pecersService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePecerDto: UpdatePecerDto) {
    return this.pecersService.update(+id, updatePecerDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.pecersService.remove(+id);
  }
}
