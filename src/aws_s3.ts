import { LocalFile } from "./data";
import { EnvironmentVariableManager } from "./env_manager";
import * as fs from 'fs';
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import path = require('path');
const fsp = fs.promises;

export class AwsS3 {
    constructor (private readonly envManager: EnvironmentVariableManager) { }

    private createS3Client(): S3Client {
        return new S3Client({
            region: this.envManager.getAWSRegion(),
            credentials: {
                accessKeyId: this.envManager.getAWSCredentials().accessKeyId,
                secretAccessKey: this.envManager.getAWSCredentials().accessKeySecret,
            }
        });
    }

    public async upload(srcFile: LocalFile, destObject: S3Object): Promise<void> {
        let stream: fs.ReadStream | null = null;
        try {
            stream  = fs.createReadStream(srcFile.getPath());
            const command = new PutObjectCommand({
                Bucket: destObject.bucket,
                Key: destObject.name,
                Body: stream,
            });
            const s3 = this.createS3Client();
            const response = await s3.send(command);

        } catch (e) {
            throw new Error(`Can not upload to s3: ${JSON.stringify(e)}`);
        } finally {
            stream?.close();
        }
    }

}

export class S3Object {
    constructor(
        public readonly bucket: string,
        public readonly name: string,
    ) {}

    public getFullPath(): string {
        return `${this.bucket}/${this.name}`;
    }
}