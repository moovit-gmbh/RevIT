import {UserService} from "@/domain/User/UserService";
import {Observable} from "rxjs";
import {first, map} from "rxjs/operators";

export interface AuthorizationHeader {
    headers: { Authorization: string }
}

export abstract class AbstractApi {

    // private token: string | undefined = undefined;

    protected constructor(private userService: UserService) {
        // this.userService.getToken$().subscribe(token => {
        //    this.token = token;
        // });
    }

    protected getAuthorizationHeader(): Observable<AuthorizationHeader>
    {
        return this.userService.getToken$().pipe(
            first(),
            map(token => {
                return this.createAuthorizationHeader(token);
            })
        );
    }

    private createAuthorizationHeader(token:string): AuthorizationHeader
    {
        return {headers: { Authorization: token }};
    }
}
