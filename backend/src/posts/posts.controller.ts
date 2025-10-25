import {
  Controller,
  Get,
  Param,
  Post as HttpPost,
  Put,
  Delete,
  Body,
  UploadedFiles,
  UseInterceptors,
  BadRequestException,
  Query,
} from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @HttpPost()
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
  async create(@Body() createPostDto: CreatePostDto, @UploadedFiles() files: Express.Multer.File[]) {
    const backendUrl = 'http://localhost:5000/uploads';

    if (files && files.length) {
      const images: string[] = [];
      const videos: string[] = [];

      files.forEach((file) => {
        const fileUrl = `${backendUrl}/${file.filename}`;
        if (file.mimetype.startsWith('image')) images.push(fileUrl);
        if (file.mimetype.startsWith('video')) videos.push(fileUrl);
      });

      createPostDto.images = images;
      createPostDto.videos = videos;
    }

    if (!createPostDto.content && (!createPostDto.images?.length && !createPostDto.videos?.length)) {
      throw new BadRequestException('Post cannot be empty');
    }

    return this.postsService.create(createPostDto);
  }

  // ✅ Supports both: /posts and /posts?userId=5
  @Get()
  findAll(@Query('userId') userId?: string) {
    if (userId) return this.postsService.findByUser(userId);
    return this.postsService.findAll();
  }

  // ✅ Keep this for explicit route like /posts/5 if you want
  @Get(':userId')
  findByUser(@Param('userId') userId: string) {
    return this.postsService.findByUser(userId);
  }

  @Put(':id')
  async update(@Param('id') id: number, @Body() updatePostDto: UpdatePostDto) {
    return this.postsService.update(id, updatePostDto);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.postsService.remove(id);
  }
}
