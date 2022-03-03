import { File, Storage } from "@google-cloud/storage";
import { LocalFile } from "./data";
import { EnvironmentVariableManager } from "./env_manager";

/**
 * Cloud StorageのPutObjectイベントで連携されるデータ型
 */
export type CloudStorageFileData = {
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

/**
 * Google Cloud Storageを操作する。
 */
export class GoogleCloudStorage {
    private gcs: Storage;
    constructor(
        envManager: EnvironmentVariableManager,
    ) {
        try {
            this.gcs = new Storage({
                credentials: envManager.getGCSCredentials(),
            });
        } catch (e) {
            throw new Error(`Error on init gcs: ${JSON.stringify(e)}`);
        }
    }

    private getGCSFile(object: GoogleCloudStorageObject): File {
        const bucket = this.gcs.bucket(object.bucket);
        return bucket.file(object.fileName);
    }

    public async fileExists(object: GoogleCloudStorageObject): Promise<boolean> {
        try {
            const file = this.getGCSFile(object);
            const result = await file.exists();
            if (!result) {
                return false;
            }
            return result[0] === true;
        } catch (e) {
            throw new Error(`Error on Google Cloud Storage: ${object.getFullPath()}`);
        }
    }

    public async download(srcObject: GoogleCloudStorageObject, destFile: LocalFile): Promise<void> {
        if (destFile.exists()) {
            await destFile.remove();
        }
        const exists = this.fileExists(srcObject);
        if (!exists) {
            throw new Error(`File not found on Google Cloud Storage: ${srcObject.getFullPath()}`);
        }
        try {
            const file = this.getGCSFile(srcObject);
            await file.download({
                destination: destFile.getPath(),
            });
        } catch (e) {
            throw new Error(`Can not download to localfile: ${JSON.stringify(e)}`);
        }
    }
}

/**
 * Google Cloud Storage 上のオブジェクトを表現する
 * オブジェクト自体の操作はしない
 */
export class GoogleCloudStorageObject {
    constructor(
        public readonly bucket: string,
        public readonly fileName: string,
    ) { }

    public getFullPath(): string {
        return `${this.bucket}/${this.fileName}`;
    }
}
