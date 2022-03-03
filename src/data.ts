import * as fs from 'fs';
const fsp = fs.promises;

export class TemporaryFileManager {
    constructor(
        private tmpDirPath: string,
    ) {}

    public getDirectoryPath(): string {
        return this.tmpDirPath;
    }

    public async createTmpDirIfNotExists(): Promise<void> {
        if (!fs.existsSync(this.getDirectoryPath())) {
            await fsp.mkdir(this.getDirectoryPath(), {
                recursive: true,
            });
        }
        return;
    }

    public getFile(fileName: string) {
        return new LocalFile(this.getDirectoryPath(), fileName);
    }

    public async delete(): Promise<void> {
        await fsp.rm(this.getDirectoryPath(), {
            recursive: true,
            force: true,
        });
    }
}

export class LocalFile {
    constructor(
        private directoryPath: string,
        private fileName: string,
    ) {}

    public getPath(): string {
        return `${this.directoryPath}/${this.fileName}`;
    }

    public exists(): boolean {
        return fs.existsSync(this.getPath());
    }

    public async remove(): Promise<void> {
        await fsp.rm(this.getPath());
    }
}