import { Injectable } from '@nestjs/common';
import { CreateActividadZonaDto } from './dto/create-actividad_zona.dto';
import { UpdateActividadZonaDto } from './dto/update-actividad_zona.dto';

@Injectable()
export class ActividadZonasService {
  create(createActividadZonaDto: CreateActividadZonaDto) {
    return 'This action adds a new actividadZona';
  }

  findAll() {
    return `This action returns all actividadZonas`;
  }

  findOne(id: number) {
    return `This action returns a #${id} actividadZona`;
  }

  update(id: number, updateActividadZonaDto: UpdateActividadZonaDto) {
    return `This action updates a #${id} actividadZona`;
  }

  remove(id: number) {
    return `This action removes a #${id} actividadZona`;
  }
}
