import {Observable, of} from "rxjs";
import {catchError, first, map, mergeMap} from "rxjs/operators";
import {ErrorService} from "@/domain/ErrorService";
import Axios from "axios-observable";
import {ConfigService} from "@/domain/ConfigService";
import {AbstractApi, AuthorizationHeader} from "@/api/AbstractApi";
import {UserService} from "@/domain/User/UserService";

export class NamespaceApi extends AbstractApi {

    constructor(
        private errorService: ErrorService,
        private configService: ConfigService,
        userService: UserService,
    ) {
        super(userService);
    }

    public getUserNamespaceList(userId:string): Observable<string[]> {
        return this.getAuthorizationHeader().pipe(
            first(),
            mergeMap(authorizationHeader => {
                return this.runGetUserNamespaceListRequest(userId, authorizationHeader);
            })
        );
    }

    private runGetUserNamespaceListRequest(userId: string, authorizationHeader: AuthorizationHeader) {
        const url = this.configService.getRestAPIURL() + "/user/" + encodeURIComponent(userId) + "/namespaces";
        return Axios.get<string[]>(url, authorizationHeader).pipe(
            map(axiosResponse => {
                let result: string[];
                const httpResponseCode = axiosResponse.status;

                switch (httpResponseCode) {
                    case 200:
                        result = axiosResponse.data;
                        break;

                    default:
                        result = [];
                        console.error("Retrieving user namespace list by userId request failed with unknown response code: " + httpResponseCode + "!");
                        break;
                }

                return result;
            }),
            catchError((err) => {
                console.error("Retrieving user namespace list by userId request failed with error: " + err);
                return of([]);
            })
        );
    }

}
