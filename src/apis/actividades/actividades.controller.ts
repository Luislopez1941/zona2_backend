import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ActividadesService } from './actividades.service';
import { CreateActividadeDto } from './dto/create-actividade.dto';
import { UpdateActividadeDto } from './dto/update-actividade.dto';
import { UpdatePublicDto } from './dto/update-public.dto';

@Controller('actividades')
export class ActividadesController {
  constructor(private readonly actividadesService: ActividadesService) {}

  @Post('create')
  create(@Body() createActividadeDto: CreateActividadeDto) {
    return this.actividadesService.create(createActividadeDto);
  }

  @Get('get-by-runneruid/:runneruid')
  findByRunnerUID(@Param('runneruid') runneruid: string) {
    return this.actividadesService.findByRunnerUID(runneruid);
  }

  @Get('feed/:runneruid')
  getFeed(
    @Param('runneruid') runneruid: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 20;
    return this.actividadesService.getFeed(runneruid, pageNum, limitNum);
  }

  @Patch('update-public/:runneruid')
  updatePublic(@Param('runneruid') runneruid: string, @Body() updatePublicDto: UpdatePublicDto) {
    return this.actividadesService.updatePublic(runneruid, updatePublicDto);
  }

  @Get('feed-public')
  getFeedPublic() {
    return this.actividadesService.getFeedPublic();
  }

  @Get('get-all')
  findAll() {
    return this.actividadesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.actividadesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateActividadeDto: UpdateActividadeDto) {
    return this.actividadesService.update(+id, updateActividadeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.actividadesService.remove(+id);
  }
}
