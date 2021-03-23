import {Job} from "@/domain/Job/Job";

export interface UploadStatus {
    isFinished: boolean,
    progress: number,
    result?: Job,
    failed: boolean,
    errorMessage?: string
}
