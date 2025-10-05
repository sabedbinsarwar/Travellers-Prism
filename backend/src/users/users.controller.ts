import {
  Controller,
  Get,
  Param,
  Put,
  Body,
  UploadedFiles,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  async all() {
    return this.usersService.findAll();
  }

  @Get(':id')
  async get(@Param('id') id: string) {
    return this.usersService.findById(parseInt(id));
  }

  @Put(':id')
  @UseInterceptors(
    AnyFilesInterceptor({
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, uniqueSuffix + extname(file.originalname));
        },
      }),
    }),
  )
  async update(
    @Param('id') id: string,
    @Body() body: any,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    const updateData: any = {};

    if (body.bio) updateData.bio = body.bio;
    if (body.location) updateData.location = body.location;

    if (files && files.length) {
      files.forEach((file) => {
        const fileUrl = `http://localhost:5000/uploads/${file.filename}`;
        if (file.fieldname === 'profilePic') updateData.profilePic = fileUrl;
        if (file.fieldname === 'coverPic') updateData.coverPic = fileUrl;
      });
    }

    if (!Object.keys(updateData).length) {
      throw new BadRequestException('No data or files provided for update');
    }

    return this.usersService.updateUser(parseInt(id), updateData);
  }
}
