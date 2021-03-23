import {Observable, OperatorFunction, ReplaySubject} from "rxjs";
import {ErrorService} from "@/domain/ErrorService";
import {NamespaceApi} from "@/api/Namespace/NamespaceApi";
import {filter, map} from "rxjs/operators";

export class NamespaceService {

    private namespaceListByUserMapSnapshot = new Map<string, string[]>();
    private namespaceListByUserMap$ = new ReplaySubject<Map<string, string[]>>(1);

    constructor(
        private errorService: ErrorService,
        private namespaceApi: NamespaceApi
    ) {

    }

    public getNamespaceListByUserId$(userId: string): Observable<string[]> {
        if (!this.namespaceListByUserMapSnapshot.has(userId)) {
            this.namespaceApi.getUserNamespaceList(userId).subscribe(namespaces => {
                this.namespaceListByUserMapSnapshot.set(userId, namespaces);
                this.namespaceListByUserMap$.next(this.namespaceListByUserMapSnapshot);
            });
        }
        return this.namespaceListByUserMap$.pipe(
            map(map => {
                return map.get(userId);
            }),
            filter(namespace => namespace !== undefined) as OperatorFunction<string[] | undefined, string[]>
        );
    }

}
