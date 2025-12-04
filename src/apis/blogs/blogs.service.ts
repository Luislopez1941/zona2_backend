import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { blog_Estado } from '@prisma/client';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';

@Injectable()
export class BlogsService {
  constructor(private readonly prisma: PrismaService) {}

  create(createBlogDto: CreateBlogDto) {
    return 'This action adds a new blog';
  }

  async findAll() {
    const blogs = await this.prisma.blog.findMany({
      where: {
        Estado: blog_Estado.Publicado, // Solo blogs publicados
      },
      orderBy: {
        FechaPublicacion: 'desc', // Más recientes primero
      },
    });

    return {
      message: 'Blogs obtenidos exitosamente',
      status: 'success',
      total: blogs.length,
      blogs,
    };
  }

  findOne(id: number) {
    return `This action returns a #${id} blog`;
  }

  update(id: number, updateBlogDto: UpdateBlogDto) {
    return `This action updates a #${id} blog`;
  }

  remove(id: number) {
    return `This action removes a #${id} blog`;
  }
}
