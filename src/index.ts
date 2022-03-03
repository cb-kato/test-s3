import { Context } from "@google-cloud/functions-framework";
import { AwsS3, S3Object } from "./aws_s3";
import { TemporaryFileManager } from "./data";
import { EnvironmentVariableManagerFactory } from "./env_manager";
import {
    CloudStorageFileData,
    GoogleCloudStorage,
    GoogleCloudStorageObject,
} from "./google_cloud_storage";


/**
 * Google Cloud Storageにオブジェクトが配置されたイベントにより実行され、
 * 対象のファイルをダウンロードしたのちAWS S3の指定バケットにアップロードする。
 * 
 * @param message CloudStorageFileData
 * @param context Context
 */
export const execute = async (message: CloudStorageFileData, context: Context) => {
    let fm: TemporaryFileManager | null = null;
    try {
        // 環境変数またはGoogleSecretManager経由で変数を取得
        const environmentVariableManager = await new EnvironmentVariableManagerFactory().create();
        fm = new TemporaryFileManager(environmentVariableManager.getLocalDirPath());
        console.info(`>>>> Local dir: ${environmentVariableManager.getLocalDirPath()}`);
        // 一時ファイル置き場としてディレクトリを作成する
        await fm.createTmpDirIfNotExists();
        const localFile = fm.getFile(message.name);

        const downloadFile = new GoogleCloudStorageObject(message.bucket, message.name);
        const uploadFile = new S3Object(environmentVariableManager.getAWSS3BucketName(), message.name);

        // Google Cloud Storageからダウンロード
        const gcs = new GoogleCloudStorage(environmentVariableManager);
        console.info(`>>>> Download from GCS: ${downloadFile.getFullPath()}`);
        await gcs.download(downloadFile, localFile);

        // 正常にダウンロードできていない場合は終了させる
        if (!localFile.exists()) {
            throw new Error(`Download failed: ${JSON.stringify(downloadFile)} to ${JSON.stringify(localFile)}`)
        }
        console.info(`>>>> Download succeeded.`);

        // AWS S3へアップロード
        const s3 = new AwsS3(environmentVariableManager);
        console.info(`>>>> Upload to S3: ${uploadFile.getFullPath()}`);
        await s3.upload(localFile, uploadFile);

        console.info(`>>>> Upload succeeded.`);

        // お掃除
        await localFile.remove();
        console.info(`>>>> Removed tmp file`);
    } catch (e) {
        console.error(JSON.stringify(e));
        throw e;
    } finally {
        // tmpディレクトリを削除しておく
        await fm?.delete();
        console.info(`>>>> Completed`);
    }
}