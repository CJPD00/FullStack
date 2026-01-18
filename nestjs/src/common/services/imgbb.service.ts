import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';

@Injectable()
export class ImgbbService {
  private readonly apiKey = process.env.IMGBB_API_KEY;
  private readonly logger = new Logger(ImgbbService.name);

  async uploadImage(file: Express.Multer.File): Promise<string> {
    if (!this.apiKey) {
      this.logger.error('IMGBB_API_KEY is not configured');
      throw new InternalServerErrorException(
        'Image upload service is not configured',
      );
    }

    const formData = new FormData();
    formData.append('key', this.apiKey);
    formData.append('image', file.buffer.toString('base64'));

    try {
      const response = await fetch(
        `https://api.imgbb.com/1/upload?key=${this.apiKey}`,
        {
          method: 'POST',
          body: formData,
        },
      );

      const data = (await response.json()) as ImgBBResponse;

      if (!data.success) {
        throw new Error(
          data.error?.message || 'Failed to upload image to ImgBB',
        );
      }

      return data.data.url;
    } catch (error) {
      this.logger.error('ImgBB Upload Error:', error);
      throw new InternalServerErrorException('Could not upload image');
    }
  }
}

interface ImgBBResponse {
  data: {
    url: string;
  };
  success: boolean;
  status: number;
  error?: {
    message: string;
  };
}
