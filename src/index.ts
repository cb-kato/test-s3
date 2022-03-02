import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import type { Context } from '@google-cloud/functions-framework/build/src/functions';
import { Storage } from '@google-cloud/storage';
import * as fs from 'fs';
import path = require('path');
import * as dotenv from 'dotenv';

if (process.env.ENVIRONMENT != 'production') {
  dotenv.config();
}

const fsp = fs.promises;

// configure GCP
const BucketName = process.env.GCS_BUCKET!;
const bucketDirectoryName = 'exported';
const gcs = new Storage({
  keyFilename: './key.json',
});
const imageBucket = gcs.bucket(BucketName);


// configure aws
const s3Params = {
  region: 'us-west-2',
  credentials: {
    accessKeyId: process.env.AWS_ACCESSKEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  }
};
const s3bucketName = process.env.AWS_BUCKET!;
const s3 = new S3Client(s3Params);

type CloudStorageFile = {
  kind: string,           // "storage#object",
  id: string,             // "test-cookbizjp-ga4-export-pageview/exported/exported_000000000001.parquet/1644974954470134",
  selfLink: string,       // "https://www.googleapis.com/storage/v1/b/test-cookbizjp-ga4-export-pageview/o/exported%2Fexported_000000000001.parquet",
  name: string,           // "exported/exported_000000000001.parquet",
  bucket: string,         // "test-cookbizjp-ga4-export-pageview",
  generation: string,     // "1644974954470134",
  metageneration: string, // "1",
  contentType: string,    // "application/octet-stream",
  timeCreated: string,    // "2022-02-16T01:29:14.475Z",
  updated: string,        // "2022-02-16T01:29:14.475Z",
  storageClass: string,   // "STANDARD",
  timeStorageClassUpdated: string, // "2022-02-16T01:29:14.475Z",
  size: string,           // "2374267",
  md5Hash: string,        // "78jd/4ewFt9OxMAr0vy3vw==",
  mediaLink: string,      // "https://www.googleapis.com/download/storage/v1/b/test-cookbizjp-ga4-export-pageview/o/exported%2Fexported_000000000001.parquet?generation=1644974954470134&alt=media",
  crc32c: string,         // "Xtj/QQ==",
  etag: string,           // "CPa1zZ6Jg/YCEAE="
}

// export const execute: EventFunction = async (message: PubsubMessage, context: Context) => {
export const execute = async (message: CloudStorageFile, context: Context) => {

  console.log(`execute: ${JSON.stringify(message)}`);

  const fileName = message.name;

  if (!fs.existsSync(`/tmp/${bucketDirectoryName}`)) {
    await fsp.mkdir(`/tmp/${bucketDirectoryName}`)
  }

  const file = imageBucket.file(fileName);
  if (!(await file.exists())) {
    console.warn('File is not exists');
    return;
  }
  const filePath = `/tmp/${fileName}`;
  console.log(`Downloading: ${file.name}`);
  const [contents] = await file.download({
    destination: filePath,
  });

  console.log(`File exists: ${fs.existsSync(filePath)}`);

  await uploadToS3(filePath);

  console.log(`Deleting: ${fileName}`);
  await fsp.rm(filePath);
  console.log(`Deleted: ${fileName}`);
  console.log(`File exists: ${fs.existsSync(filePath)}`);

  // https://storage.cloud.google.com/test-cookbizjp-ga4-export-pageview/exported/exported_000000000000.parquet
  // gs://test-cookbizjp-ga4-export-pageview/exported/exported_000000000000.parquet
  return;
}

async function uploadToS3(filePath: string): Promise<void> {

  try {
    console.log('Uploading S3');

    const stream = fs.createReadStream(filePath);
    const command = new PutObjectCommand({
      Bucket: s3bucketName,
      Key: path.basename(filePath),
      Body: stream,
    });
    const response = await s3.send(command);
    console.info(`Upload S3 success: ${path.basename(filePath)} \n${JSON.stringify(response)}`);
  } catch (e) {
    console.error(`Upload S3 success: ${JSON.stringify(e)}`);
  }
} 