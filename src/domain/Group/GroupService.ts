import {Observable, of, OperatorFunction, ReplaySubject} from "rxjs";
import {ErrorService} from "@/domain/ErrorService";
import {GroupApi} from "@/api/Group/GroupApi";
import {Group} from "@/domain/Group/Group";
import {map, tap} from "rxjs/operators";
import {JobApi} from "@/api/Job/JobApi";
import {GroupWithRights} from "@/domain/Group/GroupWithRights";
import {Job} from "@/domain/Job/Job";

export class GroupService {

    private jobId2GroupsMapSnapshot = new Map<string, GroupWithRights[]>();
    private jobId2GroupsMap$ = new ReplaySubject<Map<string, GroupWithRights[]>>(1);

    constructor(
        private errorService: ErrorService,
        private groupApi: GroupApi,
        private jobApi: JobApi
    ) {}

    public getGroupList$(jobId:string): Observable<GroupWithRights[]> {
        return this.jobId2GroupsMap$.pipe(
            map(jobId2GroupsMap => {
                return jobId2GroupsMap.get(jobId) ?? []
            })
        );
    }

    public getUnusedGroupListByNamespace(jobId:string, namespace:string): Observable<Group[] | undefined> {
        const usedGroupIds = this.jobId2GroupsMapSnapshot.get(jobId)?.map(group => group.id) ?? [];

        return this.groupApi.getGroupListByNamespace(namespace).pipe(
            map(groupList => {
                if(groupList == undefined) {
                    return undefined;
                }
                return groupList.filter(group => !usedGroupIds.includes(group.id));
            })
        );
    }

    public addGroup(jobId:string, group:GroupWithRights): Observable<GroupWithRights | undefined> {
        const groupList = this.jobId2GroupsMapSnapshot.get(jobId) ?? [];

        console.log("group to add");
        console.log(group);

        // add group to list
        groupList.push(group);

        return this.setJobGroupsAndUpdateGroupList(jobId, groupList).pipe(
            // return group instead of job
            map((setJobGroupsResult) => {
                const hasBeenSuccessful = setJobGroupsResult != undefined;
                if(hasBeenSuccessful) {
                    return group;
                } else {
                    return undefined;
                }
            })
        );
    }

    private setJobGroupsAndUpdateGroupList(jobId:string, newGroupList:GroupWithRights[]): Observable<Job | undefined>
    {
        return this.jobApi.setJobGroups(jobId, newGroupList).pipe(
            // log result
            tap((setJobGroupsResult) => {
                if(setJobGroupsResult == undefined) {
                    console.error("Failed to set job groups")
                } else {
                    console.log("Set job groups. Here is the result:");
                    console.log(setJobGroupsResult);
                }
            }),

            // update group list
            tap((setJobGroupsResult) => {
                const hasBeenSuccessful = setJobGroupsResult != undefined;
                if(hasBeenSuccessful) {
                    this.updateGroupListOfJob(jobId, newGroupList);
                }
            })
        );
    }

    private updateGroupListOfJob(jobId: string, groupList: GroupWithRights[]) {
        // update map
        this.jobId2GroupsMapSnapshot.set(jobId, groupList);

        // broadcast changes
        this.jobId2GroupsMap$.next(this.jobId2GroupsMapSnapshot);
    }

    public updateGroup(jobId:string, group:GroupWithRights): Observable<GroupWithRights | undefined>
    {
        let foundGroup = this.jobId2GroupsMapSnapshot.get(jobId)?.find(currentGroup => currentGroup.id == group.id) !== undefined;
        if (!foundGroup) {
            console.error("group not found");
            return of(undefined);
        }

        let newGroupList = this.generateUpdatedGroupList(jobId, group);

        return this.setJobGroupsAndUpdateGroupList(jobId, newGroupList).pipe(
            // return group instead of job
            map((setJobGroupsResult) => {
                const hasBeenSuccessful = setJobGroupsResult != undefined;
                if(hasBeenSuccessful) {
                    return group;
                } else {
                    return undefined;
                }
            })
        );
    }

    private generateUpdatedGroupList(jobId: string, group: GroupWithRights): GroupWithRights[]
    {
        let groupList = this.jobId2GroupsMapSnapshot.get(jobId) ?? [];
        return groupList.map(currentGroup => {
            if (currentGroup.id == group.id) {
                return group;
            }
            return currentGroup;
        });
    }

    public deleteGroup(jobId:string, group:GroupWithRights): Observable<boolean> {
        const groupList = this.jobId2GroupsMapSnapshot.get(jobId) ?? [];

        let foundGroup = groupList.find(currentGroup => currentGroup.id == group.id) !== undefined;
        if (!foundGroup) {
            console.error("group not found");
            return of(false);
        }

        const newGroupList = groupList.filter(currentGroup => currentGroup.id != group.id);

        return this.setJobGroupsAndUpdateGroupList(jobId, newGroupList).pipe(
            // return boolean instead of job
            map((setJobGroupsResult) => {
                const hasBeenSuccessful = setJobGroupsResult != undefined;
                return hasBeenSuccessful;
            })
        );

    }

}
