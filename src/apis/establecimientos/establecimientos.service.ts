import { Injectable } from '@nestjs/common';
import { CreateEstablecimientoDto } from './dto/create-establecimiento.dto';
import { UpdateEstablecimientoDto } from './dto/update-establecimiento.dto';

@Injectable()
export class EstablecimientosService {
  create(createEstablecimientoDto: CreateEstablecimientoDto) {
    return 'This action adds a new establecimiento';
  }

  findAll() {
    return `This action returns all establecimientos`;
  }

  findOne(id: number) {
    return `This action returns a #${id} establecimiento`;
  }

  update(id: number, updateEstablecimientoDto: UpdateEstablecimientoDto) {
    return `This action updates a #${id} establecimiento`;
  }

  remove(id: number) {
    return `This action removes a #${id} establecimiento`;
  }
}
