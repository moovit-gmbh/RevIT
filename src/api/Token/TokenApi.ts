import {Observable, of} from "rxjs";
import {catchError, first, map, mergeMap} from "rxjs/operators";
import {ErrorService} from "@/domain/ErrorService";
import Axios from "axios-observable";
import {ConfigService} from "@/domain/ConfigService";
import {AbstractApi, AuthorizationHeader} from "@/api/AbstractApi";
import {UserService} from "@/domain/User/UserService";
import {Token} from "@/domain/Token/Token";
import {ApiTokenData} from "@/api/Token/ApiTokenData";

export class TokenApi extends AbstractApi {

    constructor(
        private errorService: ErrorService,
        private configService: ConfigService,
        userService: UserService,
    ) {
        super(userService);
    }

    public addToken(jobId: string, token: Token): Observable<Token | undefined> {
        let apiToken = this.convertToken2ApiTokenData(token);
        return this.getAuthorizationHeader().pipe(
            first(),
            mergeMap(authorizationHeader => {
                return this.runAddTokenRequest(jobId, apiToken, authorizationHeader);
            })
        );
    }

    private convertToken2ApiTokenData(token: Token) {
        if (token.hasOwnProperty("id")) {
            return Object.assign({"_id": (token as { "id": string })["id"]}, token);
        } else {
            return Object.assign({} as ApiTokenData, token);
        }
    }

    private runAddTokenRequest(jobId: string, apiTokenData: ApiTokenData, authorizationHeader: AuthorizationHeader): Observable<Token | undefined> {
        const url = this.configService.getRestAPIURL() + "/token/" + encodeURIComponent(jobId);
        return Axios.post<ApiTokenData>(url, apiTokenData, authorizationHeader).pipe(
            map(axiosResponse => {
                let result: Token | undefined;
                const httpResponseCode = axiosResponse.status;

                console.log("axiosResponse of runAddTokenRequest is:");
                console.log(axiosResponse);

                switch (httpResponseCode) {
                    case 200:
                        result = Object.assign({"id": axiosResponse.data._id}, axiosResponse.data);
                        break;

                    default:
                        result = undefined;
                        console.error("Adding token request failed with unknown response code: " + httpResponseCode + "!");
                        break;
                }

                return result;
            }),
            catchError((err) => {
                console.error("Adding token request failed with error: " + err);
                return of(undefined);
            })
        );
    }

    public setTokensOfJob(jobId:string, tokens:Token[]): Observable<Token[] | undefined> {
        let apiTokens = tokens.map(token => this.convertToken2ApiTokenData(token));
        return this.getAuthorizationHeader().pipe(
            first(),
            mergeMap(authorizationHeader => {
                return this.runSetTokensOfJobRequest(jobId, apiTokens, authorizationHeader);
            })
        );
    }

    private runSetTokensOfJobRequest(jobId:string, apiTokenDataList:ApiTokenData[], authorizationHeader: AuthorizationHeader): Observable<Token[] | undefined>
    {
        const url = this.configService.getRestAPIURL() + "/token/" + encodeURIComponent(jobId);
        return Axios.put<ApiTokenData[]>(url, apiTokenDataList, authorizationHeader).pipe(
            map(axiosResponse => {
                let result: Token[] | undefined;
                const httpResponseCode = axiosResponse.status;

                console.log("axiosResponse of runUpdateTokenRequest is:");
                console.log(axiosResponse);

                switch (httpResponseCode) {
                    case 200:
                        result = axiosResponse.data.map(token => {
                            return Object.assign({"id": token._id}, token);
                        });
                        break;

                    default:
                        result = undefined;
                        console.error("Updating token request failed with response code: " + httpResponseCode + "!");
                        break;
                }

                return result;
            }),
            catchError((err) => {
                console.error("Updating token request failed with error: " + err);
                return of(undefined);
            })
        );
    }

    public deleteToken(token:Token): Observable<boolean> {
        return this.getAuthorizationHeader().pipe(
            first(),
            mergeMap(authorizationHeader => {
                return this.runDeleteTokenRequest(token.id, authorizationHeader);
            })
        );
    }

    private runDeleteTokenRequest(tokenId: string, authorizationHeader: AuthorizationHeader) {
        const url = this.configService.getRestAPIURL() + "/token/" + encodeURIComponent(tokenId);
        return Axios.delete<ApiTokenData>(url, authorizationHeader).pipe(
            map(axiosResponse => {
                let result: boolean;
                const httpResponseCode = axiosResponse.status;

                console.log("axiosResponse of runDeleteTokenRequest is:");
                console.log(axiosResponse);

                switch (httpResponseCode) {
                    case 200:
                        result = true;
                        break;

                    default:
                        result = false;
                        console.error("Adding token failed with response code: " + httpResponseCode + "!");
                        break;
                }

                return result;
            }),
            catchError((err) => {
                console.error("Delete token request failed with error: " + err);
                return of(false);
            })
        );
    }

}
