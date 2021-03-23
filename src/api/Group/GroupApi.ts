import {Observable, of} from "rxjs";
import {catchError, first, map, mergeMap} from "rxjs/operators";
import {ErrorService} from "@/domain/ErrorService";
import Axios from "axios-observable";
import {ConfigService} from "@/domain/ConfigService";
import {AbstractApi, AuthorizationHeader} from "@/api/AbstractApi";
import {UserService} from "@/domain/User/UserService";
import {Group} from "@/domain/Group/Group";
import {ApiGroupData} from "@/api/Group/ApiGroupData";

export class GroupApi extends AbstractApi {

    constructor(
        private errorService: ErrorService,
        private configService: ConfigService,
        userService: UserService,
    ) {
        super(userService);
    }

    /*public addGroup(jobId: string, group: Group): Observable<Group | undefined> {
        let apiGroup = this.convertGroup2ApiGroupData(group);
        return this.getAuthorizationHeader().pipe(
            first(),
            mergeMap(authorizationHeader => {
                return this.runAddGroupRequest(jobId, apiGroup, authorizationHeader);
            })
        );
    }

    private convertGroup2ApiGroupData(group: Group) {
        if (group.hasOwnProperty("id")) {
            return Object.assign({"_id": (group as { "id": string })["id"]}, group);
        } else {
            return Object.assign({} as ApiGroupData, group);
        }
    }

    private runAddGroupRequest(jobId: string, apiGroupData: ApiGroupData, authorizationHeader: AuthorizationHeader): Observable<Group | undefined> {
        const url = this.configService.getRestAPIURL() + "/group/" + encodeURIComponent(jobId);
        return Axios.post<ApiGroupData>(url, apiGroupData, authorizationHeader).pipe(
            map(axiosResponse => {
                let result: Group | undefined;
                const httpResponseCode = axiosResponse.status;

                console.log("axiosResponse of runAddGroupRequest is:");
                console.log(axiosResponse);

                switch (httpResponseCode) {
                    case 200:
                        result = Object.assign({"id": axiosResponse.data._id}, axiosResponse.data);
                        break;

                    default:
                        result = undefined;
                        console.error("Adding group request failed with unknown response code: " + httpResponseCode + "!");
                        break;
                }

                return result;
            }),
            catchError((err) => {
                console.error("Adding group request failed with error: " + err);
                return of(undefined);
            })
        );
    }

    public setGroupsOfJob(jobId:string, groups:Group[]): Observable<Group[] | undefined> {
        let apiGroups = groups.map(group => this.convertGroup2ApiGroupData(group));
        return this.getAuthorizationHeader().pipe(
            first(),
            mergeMap(authorizationHeader => {
                return this.runSetGroupsOfJobRequest(jobId, apiGroups, authorizationHeader);
            })
        );
    }

    private runSetGroupsOfJobRequest(jobId:string, apiGroupDataList:ApiGroupData[], authorizationHeader: AuthorizationHeader): Observable<Group[] | undefined>
    {
        const url = this.configService.getRestAPIURL() + "/group/" + encodeURIComponent(jobId);
        return Axios.put<ApiGroupData[]>(url, apiGroupDataList, authorizationHeader).pipe(
            map(axiosResponse => {
                let result: Group[] | undefined;
                const httpResponseCode = axiosResponse.status;

                console.log("axiosResponse of runUpdateGroupRequest is:");
                console.log(axiosResponse);

                switch (httpResponseCode) {
                    case 200:
                        result = axiosResponse.data.map(group => {
                            return Object.assign({"id": group._id}, group);
                        });
                        break;

                    default:
                        result = undefined;
                        console.error("Updating group request failed with response code: " + httpResponseCode + "!");
                        break;
                }

                return result;
            }),
            catchError((err) => {
                console.error("Updating group request failed with error: " + err);
                return of(undefined);
            })
        );
    }*/

    public getGroupListByNamespace(namespace:string): Observable<Group[] | undefined> {
        return this.getAuthorizationHeader().pipe(
            first(),
            mergeMap(authorizationHeader => {
                return this.runGetGroupListByNamespaceRequest(namespace, authorizationHeader);
            })
        );
    }

    private runGetGroupListByNamespaceRequest(namespace: string, authorizationHeader: AuthorizationHeader): Observable<Group[] | undefined> {
        const url = this.configService.getRestAPIURL() + "/group?namespace=" + encodeURIComponent(namespace);
        return Axios.get<ApiGroupData[]>(url, authorizationHeader).pipe(
            map(axiosResponse => {
                let result: Group[] | undefined;
                const httpResponseCode = axiosResponse.status;

                console.log("axiosResponse of runGetGroupListByNamespaceRequest is:");
                console.log(axiosResponse);

                switch (httpResponseCode) {
                    case 200:
                        result = axiosResponse.data.map(apiGroupData => {
                            return Object.assign({"id": apiGroupData._id}, apiGroupData);
                        });
                        break;

                    default:
                        result = [];
                        console.error("Retrieving user group list by userId request failed with unknown response code: " + httpResponseCode + "!");
                        break;
                }

                return result;
            }),
            catchError((err) => {
                console.error("Retrieving user group list by userId request failed with error: " + err);
                return of(undefined);
            })
        );
    }

    /*public deleteGroup(group:Group): Observable<boolean> {
        return this.getAuthorizationHeader().pipe(
            first(),
            mergeMap(authorizationHeader => {
                return this.runDeleteGroupRequest(group.id, authorizationHeader);
            })
        );
    }

    private runDeleteGroupRequest(groupId: string, authorizationHeader: AuthorizationHeader) {
        const url = this.configService.getRestAPIURL() + "/group/" + encodeURIComponent(groupId);
        return Axios.delete<ApiGroupData>(url, authorizationHeader).pipe(
            map(axiosResponse => {
                let result: boolean;
                const httpResponseCode = axiosResponse.status;

                console.log("axiosResponse of runDeleteGroupRequest is:");
                console.log(axiosResponse);

                switch (httpResponseCode) {
                    case 200:
                        result = true;
                        break;

                    default:
                        result = false;
                        console.error("Adding group failed with response code: " + httpResponseCode + "!");
                        break;
                }

                return result;
            }),
            catchError((err) => {
                console.error("Delete group request failed with error: " + err);
                return of(false);
            })
        );
    }*/

}
