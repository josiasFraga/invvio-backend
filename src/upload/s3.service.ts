import { Injectable } from '@nestjs/common';
import * as AWS from 'aws-sdk';

@Injectable()
export class S3Service {
	private readonly s3: AWS.S3;
	private readonly bucketName = 'buzke-images';

	constructor() {
		this.s3 = new AWS.S3({
		region: 'sa-east-1',
		credentials: {
			accessKeyId: process.env.AWS_ACCESS_KEY || '',
			secretAccessKey: process.env.AWS_SECRET_KEY || '',
		},
		// Se quiser desabilitar verificação SSL local, etc.
		//httpOptions: { rejectUnauthorized: false }
		});
	}

	async uploadFile(buffer: Buffer, key: string, contentType: string) {
		// Faz upload para S3 usando putObject
		const result = await this.s3
		.putObject({
			Bucket: this.bucketName,
			Key: key,
			Body: buffer,
			ContentType: contentType,
		})
		.promise();

		// Retorna a URL pública (se estiver configurado para público) ou a local do objeto
		return `https://${this.bucketName}.s3.amazonaws.com/${key}`;
	}

	async deleteFile(key: string) {
		await this.s3
		.deleteObject({
			Bucket: this.bucketName,
			Key: key,
		})
		.promise();
	}
}