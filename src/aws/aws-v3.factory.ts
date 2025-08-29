import 'dotenv/config';
import { S3Client } from '@aws-sdk/client-s3';
import { SESClient } from '@aws-sdk/client-ses';

const awsConfig = {
  region: 'sa-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY!,
    secretAccessKey: process.env.AWS_SECRET_KEY!,
  },
};

export const s3Client = new S3Client(awsConfig);
export const sesClient = new SESClient(awsConfig);
