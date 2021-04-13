export interface FFmpegConvertStatus {
    isFinished: boolean;
    StdOut: string;
    StdErr: string;
    exitCode?: number;
    outputFilePath: string;
    progress?: number;
}
