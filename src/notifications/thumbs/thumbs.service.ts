import { Injectable } from '@nestjs/common';
import { URL } from 'url';

@Injectable()
export class ThumbsService {
  /**
   * Retorna a URL de uma imagem na pasta `thumbs`
   * @param imageUrl URL original da imagem
   * @returns URL da imagem na pasta `thumbs` ou null se a URL for inválida
   */
  getThumbFromImage(imageUrl: string | null): string | null {
    if (!imageUrl) {
      return null;
    }

    const url = new URL(imageUrl);
    const pathParts = url.pathname.split('/');
    const fileName = pathParts.pop();
    const directory = pathParts.join('/');

    return `${url.origin}${directory}/thumbs/${fileName}`;
  }

  /**
   * Retorna a URL de uma imagem arredondada na pasta `round_thumbs`
   * @param imageUrl URL original da imagem
   * @returns URL da imagem arredondada na pasta `round_thumbs` ou null se a URL for inválida
   */
  getRoundThumbFromImage(imageUrl: string | null): string | null {
    if (!imageUrl) {
      return null;
    }

    const url = new URL(imageUrl);
    const pathParts = url.pathname.split('/');
    const fileNameWithExt = pathParts.pop();
    const directory = pathParts.join('/');

    if (!fileNameWithExt) {
      return null;
    }

    const fileName = fileNameWithExt.split('.')[0]; // Remove a extensão
    const newFileName = `${fileName}.png`; // Define a nova extensão

    return `${url.origin}${directory}/round_thumbs/${newFileName}`;
  }
}
