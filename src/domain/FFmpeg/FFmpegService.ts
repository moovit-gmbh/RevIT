import {ErrorService} from "@/domain/ErrorService";
import {BehaviorSubject, Observable} from "rxjs";
import {FFmpegConvertStatus} from "@/domain/FFmpeg/FFmpegConvertStatus";
const fs = require('fs');
const appRootDir = require('app-root-dir').get();
const crypto = require("crypto");

export class FFmpegService {

    private usedFileNamesBuffer: string[] = [];


    constructor(private errorService: ErrorService) {
        this.emptyOutputFolder();
        this.createOutputFolderIfNotExists();
    }

    /**
     * @see https://stackoverflow.com/questions/33152533/bundling-precompiled-binary-into-electron-app/38373289#38373289
     * @param inputFilePath
     */
    public convertVideoFile(inputFilePath:string): Observable<FFmpegConvertStatus>
    {
        const outputFilePath = this.createUnusedOutputFilePath();

        const status = {
            isFinished: false,
            StdOut: "",
            StdErr: "",
            outputFilePath: outputFilePath
        } as FFmpegConvertStatus;

        const subject = new BehaviorSubject(status);

        const appRootDir = require('app-root-dir').get();
        const ffmpegPath = appRootDir + '/bin/ffmpeg';
        const spawn = require( 'child_process' ).spawn;

        // const testSettings = ['-i', inputFilePath, 'out.mp4'];

        const settings = [
            '-i', inputFilePath, '-vf', 'yadif,format=yuv420p', '-force_key_frames', 'expr:gte(t\,n_forced/2)', '-c:v',
            'libx264', '-crf', 18, '-bf', 2, '-c:a', 'aac', '-q:a', 1, '-ac', 2, '-ar', 48000, '-use_editlist', 0,
            '-movflags', '+faststart', outputFilePath
        ];

        const childProcess = spawn(ffmpegPath, settings);

        // watch standard output of ffmpeg command
        childProcess.stdout.on( 'data', (data:string) => {
            console.log( `convertVideoFile ffmpeg stdout: ${data}` );
            status.StdOut += data;
            subject.next(status);
        });

        // watch error output of ffmpeg command
        childProcess.stderr.on( 'data', (data:string) => {
            console.log( `convertVideoFile ffmpeg stderr: ${data}` );
            status.StdErr += data;
            subject.next(status);
        });

        // watch end of ffmpeg command
        childProcess.on('close', (code:number) => {
            console.log(`convertVideoFile ffmpeg process exited with code ${code}`);
            status.isFinished = true;
            status.exitCode = code;
            if(code == 0) {
                console.log("covertVideoFile process ended without error");
            } else {
                console.error("covertVideoFile process ended with error");
            }
            subject.next(status);
        });

        return subject.asObservable();
    }

    private createUnusedOutputFilePath(): string
    {
        const path = require('path');
        let outputFolderPath = this.getOutputFolderPath();
        while(true) {
            const fileName = crypto.randomBytes(20).toString('hex') + ".mp4";
            const filePath = path.join(outputFolderPath, fileName);
            const fileNameExistsInUsedFileNamesBuffer = this.usedFileNamesBuffer.find(usedFileName => usedFileName == fileName) !== undefined;
            if(fileNameExistsInUsedFileNamesBuffer) {
                continue;
            }
            if(fs.existsSync(filePath)) {
                continue;
            }
            this.usedFileNamesBuffer.push(fileName); // add to buffer
            return filePath;
        }
    }

    private createOutputFolderIfNotExists() {
        if (!fs.existsSync(this.getOutputFolderPath())){
            fs.mkdirSync(this.getOutputFolderPath(), {
                recursive: true
            });
        }
    }

    private emptyOutputFolder() {
        const path = require('path');
        let outputFolderPath = this.getOutputFolderPath();
        if (!fs.existsSync(outputFolderPath)){
            return; // nothing to do
        }
        fs.readdir(outputFolderPath, (err: NodeJS.ErrnoException | null, files: string[]) => {
            files.forEach(fileName => {
                if(!fileName.endsWith(".mp4")) {
                    return; // we only care about mp4 files
                }
                const filePath = path.join(outputFolderPath, fileName);
                console.log("removing file \"" + fileName + "\"..");
                fs.unlink(filePath, (err:NodeJS.ErrnoException | null) => {
                    if (err) {
                        console.error("Failed to remove file \"" + fileName + "\": " + err);
                    }
                });
            });
        });

    }

    private getOutputFolderPath(): string
    {
        return  appRootDir + '/minimized-videos';
    }

}
