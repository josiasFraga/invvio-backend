import { Injectable } from '@nestjs/common';
import sharp from 'sharp';

@Injectable()
export class ImageProcessorService {
  /**
   * Corrige rotação (EXIF) e cria thumbnail 512x512 (mantém proporção, não recorta).
   * Saída final: JPEG buffer
   */
  async createThumbnail(buffer: Buffer): Promise<Buffer> {
    return sharp(buffer)
      .rotate() // Corrige orientação com base no EXIF
      .resize({ width: 512, height: 512, fit: 'inside' })
      .jpeg()
      .toBuffer();
  }

  /**
   * Cria thumbnail redonda (512x512) em PNG com fundo transparente.
   */
  async createRoundThumbnail(buffer: Buffer): Promise<Buffer> {
    const size = 512;

    const resized = await sharp(buffer)
      .rotate()
      .resize(size, size, { fit: 'cover' })
      .png()
      .toBuffer();

    const circleSvg = Buffer.from(
      `<svg><circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="black"/></svg>`,
    );

    return sharp(resized)
      .composite([
        {
          input: circleSvg,
          blend: 'dest-in', // "corta" em formato do círculo
        },
      ])
      .png()
      .toBuffer();
  }
}
