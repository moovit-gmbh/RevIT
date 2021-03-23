import {BehaviorSubject, Observable, of} from "rxjs";
import {catchError, first, map, mergeMap, tap} from "rxjs/operators";
import {ErrorService} from "@/domain/ErrorService";
import Axios from "axios-observable";
import {ConfigService} from "@/domain/ConfigService";
import {AbstractApi, AuthorizationHeader} from "@/api/AbstractApi";
import {UserService} from "@/domain/User/UserService";
import {ApiJobData} from "@/api/Job/ApiJobData";
import {Job} from "@/domain/Job/Job";
import {GroupWithRights} from "@/domain/Group/GroupWithRights";
import {ApiGroupWithRightsDataData} from "@/api/Group/ApiGroupWithRightsData";
import {ApiTokenData} from "@/api/Token/ApiTokenData";
import {UploadStatus} from "@/api/Job/UploadStatus";

export class JobApi extends AbstractApi {

    constructor(
        private errorService: ErrorService,
        private configService: ConfigService,
        userService: UserService,
    ) {
        super(userService);
    }

    public addJob(payload:object): Observable<Job | undefined> {
        return this.getAuthorizationHeader().pipe(
            first(),
            mergeMap(authorizationHeader => {
                return this.runAddJobRequest(payload, authorizationHeader);
            })
        );
        // {"groups":[],"tokens":[],"custom":[],"_id":"603919dbe8d8970012a82793","name":"ESL Logo on Photoshop Color.png","namespace":"Default","creator":"admin","createDate":"2021-02-26T15:55:07.877Z","status":"FILE_UPLOAD","type":"PLACEHOLDER","tile":{"size":0},"dest":"/storage/aac/4f5d3019-8928-4af0-9851-88ec1b02fcc4.mp4"}
    }

    private runAddJobRequest(payload: object, authorizationHeader: AuthorizationHeader): Observable<Job | undefined>
    {
        const url = this.configService.getRestAPIURL() + "/job";
        return Axios.post<ApiJobData>(url, payload, authorizationHeader).pipe(
            map(axiosResponse => {
                let result: Job | undefined;
                const httpResponseCode = axiosResponse.status;

                console.log("axiosResponse of runAddJobRequest is:");
                console.log(axiosResponse);

                switch (httpResponseCode) {
                    case 200:
                        result = Object.assign({"id": axiosResponse.data._id}, axiosResponse.data);
                        break;

                    default:
                        result = undefined;
                        console.error("Adding job request failed with response code: " + httpResponseCode + "!");
                        break;
                }

                return result;
            }),
            catchError((err) => {
                console.error("Adding job request failed with error: " + err);
                return of(undefined);
            })
        );
    }

    public uploadJob(job:Job, file:File): Observable<UploadStatus> {
        const apiJobData = this.convertJob2ApiJobData(job);
        return this.getAuthorizationHeader().pipe(
            first(),
            mergeMap(authorizationHeader => {
                return this.runUploadJobNameRequest(apiJobData, file, authorizationHeader);
            })
        );
    }

    private convertJob2ApiJobData(job: Job) {
        if (job.hasOwnProperty("id")) {
            return Object.assign({"_id": (job as { "id": string })["id"]}, job);
        } else {
            return Object.assign({} as ApiTokenData, job);
        }
    }

    /*
        ☐ upload job
        https://git.mvint.de/moovit/products/rushes/frontend/blob/master/src/App.vue -> vue call to worker example -> watcher fileToUpload -> with progress
        request url https://192.168.123.131/worker/v1/single
        payload  -> multipart/form-data;
        headers:
            JobId	6022554789c62700113b2326
            UploadDestination  /storage/aac/5d74f51a-b1f6-4800-b7f6-e182a6986dc9.mp4 -> getting from job.dest
            header: Authorization: Bearer ....
        response -> updated job object
     */

    private runUploadJobNameRequest(apiJobData:ApiJobData, file:File, authorizationHeader: AuthorizationHeader): Observable<UploadStatus>
    {
        const url = this.configService.getWorkerRestAPIURL() + "/single";

        let uploadData = new FormData();

        uploadData.append("file", file);
        uploadData.append("infos", "");

        let currentTime = new Date();
        console.log("start upload", currentTime.getTime());

        let progress = 0;

        const subject = new BehaviorSubject<UploadStatus>({
            failed: false,
            isFinished: false,
            progress: 0,
        } as UploadStatus);

        Axios.post<ApiJobData>(url, uploadData, {
                headers: {
                    Authorization: authorizationHeader.headers.Authorization,
                    "Content-Type": "multipart/form-data",
                    UploadDestination: apiJobData.dest,
                    JobId: apiJobData._id,
                },
                onUploadProgress: (p) => {
                    progress = Math.floor((p.loaded / p.total) * 100);
                    console.log("Current upload progress: " + progress);
                    subject.next({
                        failed: false,
                        isFinished: false,
                        progress
                    } as UploadStatus);
                },
            }

        ).pipe(
            tap(axiosResponse => {
                const httpResponseCode = axiosResponse.status;

                console.log("axiosResponse of runUpdateJobNameRequest is:");
                console.log(axiosResponse);

                switch (httpResponseCode) {
                    case 200:
                        const job = Object.assign({"id": axiosResponse.data._id}, axiosResponse.data) as Job;
                        subject.next({
                            failed: false,
                            isFinished: true,
                            progress: 100,
                            result: job
                        } as UploadStatus);
                        break;

                    default:
                        console.error("Updating job name request failed with response code: " + httpResponseCode + "!");
                        subject.next({
                            failed: true,
                            isFinished: true,
                            progress,
                            errorMessage: "HTTP Response code " + httpResponseCode + " with message: " + (axiosResponse.statusText ?? "no message")
                        } as UploadStatus);
                        break;
                }
            }),
            catchError((errorMessage:string) => {
                console.error("Updating job name request failed with error: " + errorMessage);
                subject.next({
                    failed: true,
                    isFinished: true,
                    progress,
                    errorMessage
                } as UploadStatus);
                return of(undefined);
            })
        ).subscribe(() => {}); // lets subscribe to start of the REST call

        return subject;
    }

    public updateJobName(jobId:string, newName:string): Observable<Job | undefined> {
        return this.getAuthorizationHeader().pipe(
            first(),
            mergeMap(authorizationHeader => {
                return this.runUpdateJobNameRequest(jobId, newName, authorizationHeader);
            })
        );
    }

    private runUpdateJobNameRequest(jobId:string, newName:string, authorizationHeader: AuthorizationHeader): Observable<Job | undefined>
    {
        const url = this.configService.getRestAPIURL() + "/job/" + encodeURIComponent(jobId) + "/name";
        return Axios.patch<ApiJobData>(url, {name: newName}, authorizationHeader).pipe(
            map(axiosResponse => {
                let result: Job | undefined;
                const httpResponseCode = axiosResponse.status;

                console.log("axiosResponse of runUpdateJobNameRequest is:");
                console.log(axiosResponse);

                switch (httpResponseCode) {
                    case 200:
                        result = Object.assign({"id": axiosResponse.data._id}, axiosResponse.data);
                        break;

                    default:
                        result = undefined;
                        console.error("Updating job name request failed with response code: " + httpResponseCode + "!");
                        break;
                }

                return result;
            }),
            catchError((err) => {
                console.error("Updating job name request failed with error: " + err);
                return of(undefined);
            })
        );
    }

    public setJobGroups(jobId:string, groupList:GroupWithRights[]): Observable<Job | undefined> {
        const apiGroupList = groupList.map(group => {
            return Object.assign({"_id": (group as { "id": string })["id"]}, group);
        });

        return this.getAuthorizationHeader().pipe(
            first(),
            mergeMap(authorizationHeader => {
                return this.runSetJobGroupsRequest(jobId, apiGroupList, authorizationHeader);
            })
        );
    }

    private runSetJobGroupsRequest(jobId:string, groupList:ApiGroupWithRightsDataData[], authorizationHeader: AuthorizationHeader): Observable<Job | undefined>
    {
        const url = this.configService.getRestAPIURL() + "/job/" + encodeURIComponent(jobId) + "/groups";
        return Axios.patch<ApiJobData>(url, groupList, authorizationHeader).pipe(
            map(axiosResponse => {
                let result: Job | undefined;
                const httpResponseCode = axiosResponse.status;

                console.log("axiosResponse of runSetJobGroupsRequest is:");
                console.log(axiosResponse);

                switch (httpResponseCode) {
                    case 200:
                        result = Object.assign({"id": axiosResponse.data._id}, axiosResponse.data);
                        break;

                    default:
                        result = undefined;
                        console.error("Set job-groups request failed with response code: " + httpResponseCode + "!");
                        break;
                }

                return result;
            }),
            catchError((err) => {
                console.error("Set job-groups request failed with error: " + err);
                return of(undefined);
            })
        );
    }

    /*public updateJob(jobId:string, payload:object): Observable<Job | undefined> {
        if(payload.hasOwnProperty("id")) {
            payload = Object.assign({"_id": (payload as {"id":string})["id"]}, payload);
        }
        return this.getAuthorizationHeader().pipe(
            first(),
            mergeMap(authorizationHeader => {
                return this.runUpdateJobRequest(jobId, payload, authorizationHeader);
            })
        );
    }

    private runUpdateJobRequest(jobId:string, payload:object, authorizationHeader: AuthorizationHeader): Observable<Job | undefined>
    {
        const url = this.configService.getRestAPIURL() + "/job/update/" + encodeURIComponent(jobId);
        return Axios.patch<ApiJobData>(url, payload, authorizationHeader).pipe(
            map(axiosResponse => {
                let result: Job | undefined;
                const httpResponseCode = axiosResponse.status;

                console.log("axiosResponse of runUpdateJobRequest is:");
                console.log(axiosResponse);

                switch (httpResponseCode) {
                    case 200:
                        result = Object.assign({"id": axiosResponse.data._id}, axiosResponse.data);
                        break;

                    default:
                        result = undefined;
                        console.error("Updating job request failed with response code: " + httpResponseCode + "!");
                        break;
                }

                return result;
            }),
            catchError((err) => {
                console.error("Updating job request failed with error: " + err);
                return of(undefined);
            })
        );
    }*/

    public deleteJob(jobId:string): Observable<object> {
        return this.getAuthorizationHeader().pipe(
            first(),
            mergeMap(authorizationHeader => {
                return this.runDeleteJobRequest(jobId, authorizationHeader);
            })
        );
    }

    private runDeleteJobRequest(jobId: string, authorizationHeader: AuthorizationHeader) {
        const url = this.configService.getRestAPIURL() + "/job/" + encodeURIComponent(jobId);
        return Axios.delete<object>(url, authorizationHeader).pipe(
            map(axiosResponse => {
                let result: object;
                const httpResponseCode = axiosResponse.status;

                console.log("axiosResponse of runDeleteJobRequest is:");
                console.log(axiosResponse);

                switch (httpResponseCode) {
                    case 200:
                        result = axiosResponse.data;
                        break;

                    default:
                        result = [];
                        console.error("Delete job request failed with response code: " + httpResponseCode + "!");
                        break;
                }

                return result;
            }),
            catchError((err) => {
                console.error("Delete job request failed with error: " + err);
                return of([]);
            })
        );
    }

}
