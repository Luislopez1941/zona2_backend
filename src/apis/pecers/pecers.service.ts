import { Injectable } from '@nestjs/common';
import { CreatePecerDto } from './dto/create-pecer.dto';
import { UpdatePecerDto } from './dto/update-pecer.dto';

@Injectable()
export class PecersService {
  create(createPecerDto: CreatePecerDto) {
    return 'This action adds a new pecer';
  }

  findAll() {
    return `This action returns all pecers`;
  }

  findOne(id: number) {
    return `This action returns a #${id} pecer`;
  }

  update(id: number, updatePecerDto: UpdatePecerDto) {
    return `This action updates a #${id} pecer`;
  }

  remove(id: number) {
    return `This action removes a #${id} pecer`;
  }
}
