import {ErrorService} from "@/domain/ErrorService";
import {JobApi} from "@/api/Job/JobApi";
import {Job} from "@/domain/Job/Job";
import {Observable} from "rxjs";
import {tap} from "rxjs/operators";
import {UploadStatus} from "@/api/Job/UploadStatus";

export class JobService {

    private jobData:Job | undefined = undefined;

    constructor(
        private errorService: ErrorService,
        private jobApi: JobApi
    ) {}

    public addJob(jobName:string): Observable<Job | undefined>
    {
        return this.jobApi.addJob({name: jobName}).pipe(
            tap(result => {
                console.log("Added job. Here is the result:");
                console.log(result);
                this.jobData = result;
            })
        );
    }

    public uploadJob(file:File): Observable<UploadStatus> {
        if(this.jobData === undefined) {
            throw new Error("Job cannot be null!");
        }
        return this.jobApi.uploadJob(this.jobData, file).pipe(
            tap(result => {
                console.log("New upload status:");
                console.log(result);
                if(result.isFinished) {
                    if(result.failed) {
                        console.error("Upload failed: " + result.errorMessage ?? "Unknown error");
                    } else {
                        this.jobData = result.result;
                    }
                }
            })
        );
    }

    public updateJobName(jobName:string): Observable<Job | undefined>
    {
        if(this.jobData === undefined) {
            throw new Error("Job cannot be null!");
        }
        return this.jobApi.updateJobName(this.jobData.id, jobName).pipe(
            tap(result => {
                console.log("Updated job. Here is the result:");
                console.log(result);
                this.jobData = result;
            })
        );
    }

    public finishJob() {
        this.jobData = undefined;
    }

    public removeUnfinishedJobs() {
        if(this.jobData !== undefined) {
            this.deleteJob(this.jobData.id);
        }
    }

    private deleteJob(jobId:string) {
        this.jobApi.deleteJob(jobId).subscribe(() => {
            console.log("Deleted job");
            this.jobData = undefined;
        })
    }
}
