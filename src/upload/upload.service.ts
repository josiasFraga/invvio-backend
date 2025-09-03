import { Injectable } from '@nestjs/common';
import { S3Service } from './s3.service';
import { ImageProcessorService } from './image-processor.service';
import * as path from 'path';
import * as crypto from 'crypto';

@Injectable()
export class UploadService {
	constructor(
		private readonly s3Service: S3Service,
		private readonly imageProcessor: ImageProcessorService,
	) {}

	/**
	 * Recebe um arquivo, gera ID único, faz upload do original, gera thumb, etc.
	 * @param file => Express.Multer.File
	 * @param directory => ex.: 'athletes/profiles'
	 * @param round => se deve criar round thumbnail
	 * @returns Objeto com URLs do arquivo original, thumb e (opcional) round
	 */
	async uploadAndProcess(
		file: Express.Multer.File,
		directory: string,
		round: boolean = false,
	): Promise<{
		originalUrl: string;
		thumbUrl: string;
		roundUrl?: string;
	} | null> {
		if (!file) {
		return null;
		}

		// Gera nome único
		const ext = path.extname(file.originalname); // ex.: .jpg, .png
		const baseName = crypto.randomBytes(6).toString('hex'); // ex.: 'a1b2c3'
		const imageName = `${baseName}${ext}`; // ex.: 'a1b2c3.jpg'

		// 1. Upload do original
		const originalKey = `${directory}/${imageName}`;
		const originalUrl = await this.s3Service.uploadFile(
		file.buffer,
		originalKey,
		file.mimetype,
		);

		// 2. Criar thumbnail quadrada 512x512 (JPEG)
		const thumbBuffer = await this.imageProcessor.createThumbnail(file.buffer);
		// Seta a key com "thumbs/"
		const thumbKey = `${directory}/thumbs/${baseName}.jpg`; // Sempre .jpg
		const thumbUrl = await this.s3Service.uploadFile(
		thumbBuffer,
		thumbKey,
		'image/jpeg',
		);

		// 3. Se round === true, criar round_512 (PNG)
		let roundUrl: string | undefined = undefined;
		if (round) {
		const roundBuffer = await this.imageProcessor.createRoundThumbnail(
			file.buffer,
		);
		const roundKey = `${directory}/round_thumbs/${baseName}.png`; // .png
		roundUrl = await this.s3Service.uploadFile(
			roundBuffer,
			roundKey,
			'image/png',
		);
		}

		return {
		originalUrl,
		thumbUrl,
		roundUrl,
		};
	}
}