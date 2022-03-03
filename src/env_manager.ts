import { SecretManagerServiceClient } from "@google-cloud/secret-manager";

export interface EnvironmentVariableManager {
    getLocalDirPath(): string;

    getGCSCredentials(): GCPConnectionSettings;
    getGCSBucketName(): string;
    
    getAWSCredentials(): AwsCredentials;
    getAWSS3BucketName(): string;
    getAWSRegion(): string;
}

export class AwsCredentials {
    constructor(
        public accessKeyId: string,
        public accessKeySecret: string,
    ) {}
}


/**
 * 環境変数のファクトリ
 */
 export class EnvironmentVariableManagerFactory {
    public async create(): Promise<EnvironmentVariableManager> {
        let client: SecretManagerServiceClient | null = null;

        try {
            client = new SecretManagerServiceClient();
            const gcpConnectionSettings =
                await this.getSecretItem<GCPConnectionSettings>(client, 'projects/296799770849/secrets/recommend-mart-gcp-connection-settings/versions/latest');
            if (!gcpConnectionSettings) {
                throw new Error('Not found GcpConnectionSettings on Google Secret Manager');
            }
            const awsConnectionSettings =
                await this.getSecretItem<AWSS3ConnectionSettings>(client, 'projects/296799770849/secrets/recommend-mart-aws-connection-settings/versions/latest');
            if (!awsConnectionSettings) {
                throw new Error('Not found AwsConnectionSettings on Google Secret Manager');
            }
            const dataTransferSettings =
                await this.getSecretItem<DataTransferSettings>(client, 'projects/296799770849/secrets/recommend-mart-data-transfer-settings/versions/latest');
            if (!dataTransferSettings) {
                throw new Error('Not found DataTransferSettings on Google Secret Manager');
            }
            return new GoogleCloudSecretManagerImpl(
                gcpConnectionSettings,
                awsConnectionSettings,
                dataTransferSettings,
            );

        } finally {
            client?.close();
        }
    }

    private async getSecretItem<T>(client: SecretManagerServiceClient, key: string): Promise<T | null> {
        const [serviceAccountResponse] = await client.accessSecretVersion({ name: key });
        return this.convertToJson(serviceAccountResponse.payload?.data?.toString());
    }

    private convertToJson(payload: string | null | undefined): any {
        if (!payload) {
            return null;
        }
        return JSON.parse(payload);
    }
}

/**
 * Google Secret Managerを使った環境変数の解決
 */
class GoogleCloudSecretManagerImpl implements EnvironmentVariableManager {

    constructor(
        private gcpConnectionSettings: GCPConnectionSettings,
        private awsConnectionSettings: AWSS3ConnectionSettings,
        private dataTransferSettings: DataTransferSettings
    ) { }


    getLocalDirPath(): string {
        return this.dataTransferSettings.localTmpDir;
    }
    getGCSCredentials(): GCPConnectionSettings {
        return  this.gcpConnectionSettings;
    }
    getGCSBucketName(): string {
        return this.dataTransferSettings.gcsBucket;
    }
    getAWSCredentials(): AwsCredentials {
        return new AwsCredentials(this.awsConnectionSettings.accessKeyId, this.awsConnectionSettings.secretAccessKey);
    }
    getAWSS3BucketName(): string {
        return this.dataTransferSettings.s3Bucket;
    }
    getAWSRegion(): string {
        return this.awsConnectionSettings.region;
    }

}

type GCPConnectionSettings = {
    type: string,
    project_id: string,
    private_key_id: string,
    private_key: string,
    client_email: string,
    client_id: string,
    auth_uri: string,
    token_uri: string,
    auth_provider_x509_cert_url: string,
    client_x509_cert_url: string,
}

type AWSS3ConnectionSettings = {
    region: string,
    accessKeyId: string,
    secretAccessKey: string,
}

type DataTransferSettings = {
    localTmpDir: string,
    gcsBucket: string,
    s3Bucket: string,
}
