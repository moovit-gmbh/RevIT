import {Observable, of, OperatorFunction, ReplaySubject} from "rxjs";
import {ErrorService} from "@/domain/ErrorService";
import {TokenApi} from "@/api/Token/TokenApi";
import {Token} from "@/domain/Token/Token";
import {map, mergeMap, tap} from "rxjs/operators";
import {JobApi} from "@/api/Job/JobApi";

export class TokenService {

    private jobId2TokensMapSnapshot = new Map<string, Token[]>();
    private jobId2TokensMap$ = new ReplaySubject<Map<string, Token[]>>(1);

    constructor(
        private errorService: ErrorService,
        private tokenApi: TokenApi,
        private jobApi: JobApi
    ) {}

    public getTokenList$(jobId:string): Observable<Token[]> {
        return this.jobId2TokensMap$.pipe(
            map(jobId2TokensMap => {
                return jobId2TokensMap.get(jobId) ?? []
            })
        );
    }

    public addToken(jobId:string, token:Token): Observable<Token | undefined> {
        // add jobId to token data
        token["jobId"] = jobId;

        // add token
        return this.tokenApi.addToken(jobId, token)
            .pipe(

                // log result
                tap((addTokenResult) => {
                    if(addTokenResult == undefined) {
                        console.error("Failed to add token")
                    } else {
                        console.log("Added token. Here is the result:");
                        console.log(addTokenResult);
                    }
                }),

                // update token list
                tap((addTokenResult) => {
                    if(addTokenResult != undefined) {
                        this.addTokenToTokenList(jobId, addTokenResult);
                    }
                })
            );
    }

    private addTokenToTokenList(jobId: string, token: Token) {
        const tokenList = this.jobId2TokensMapSnapshot.get(jobId) ?? [];

        // add token to list
        tokenList.push(token);

        // update map
        this.jobId2TokensMapSnapshot.set(jobId, tokenList);

        // broadcast changes
        this.jobId2TokensMap$.next(this.jobId2TokensMapSnapshot);
    }

    public updateToken(jobId:string, token:Token): Observable<Token | undefined>
    {
        let foundToken = this.jobId2TokensMapSnapshot.get(jobId)?.find(currentToken => currentToken.id == token.id) !== undefined;
        if (!foundToken) {
            console.error("token not found");
            return of(undefined);
        }

        return this.tokenApi.setTokensOfJob(jobId, this.generateUpdatedTokenList(jobId, token))
            .pipe(
                // log result
                tap((updateTokenResult) => {
                    console.log("Updated token. Here is the result:");
                    console.log(updateTokenResult);
                }),

                // update token list
                tap((updateTokenResult) => {
                    if(updateTokenResult != undefined) {
                        // update map
                        this.jobId2TokensMapSnapshot.set(jobId, updateTokenResult);

                        // broadcast changes
                        this.jobId2TokensMap$.next(this.jobId2TokensMapSnapshot);
                    }
                }),

                // return only result of current token
                map(result => {
                    if(result != undefined) {
                        return result.find(currentToken => currentToken.id == token.id);
                    }
                    return result;
                })
            );
    }

    private generateUpdatedTokenList(jobId: string, token: Token) {
        let tokenList = this.jobId2TokensMapSnapshot.get(jobId) ?? [];
        return tokenList.map(currentToken => {
            if (currentToken.id == token.id) {
                currentToken = token;
            }
            return currentToken;
        });
    }

    public deleteToken(jobId:string, token:Token): Observable<boolean> {
        return this.tokenApi.deleteToken(token).pipe(

            // log result
            tap((deleteTokenResult) => {
                console.log("Delete token. Here is the result:");
                console.log(deleteTokenResult);
            }),

            // now lets remove the token from the actual list
            tap((deleteTokenResult) => {
                if(deleteTokenResult) {
                    this.removeTokenInTokenList(jobId, token);
                }
            })

        );
    }

    private removeTokenInTokenList(jobId: string, token: Token) {
        const currentTokenList = this.jobId2TokensMapSnapshot.get(jobId) ?? [];

        // make sure token exists
        let existsToken = currentTokenList.find(currentToken => currentToken.id == token.id) != undefined;
        if (existsToken) {
            // remove token from list
            const updatedTokenList = currentTokenList.filter(currentToken => currentToken.id != token.id);

            // update map
            this.jobId2TokensMapSnapshot.set(jobId, updatedTokenList);

            // broadcast changes
            this.jobId2TokensMap$.next(this.jobId2TokensMapSnapshot);
        } else {
            console.error("token not found");
        }
    }

}
