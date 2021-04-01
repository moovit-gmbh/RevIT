import { Observable, of } from "rxjs";
import { catchError, first, map, mergeMap, tap } from "rxjs/operators";
import { ErrorService } from "@/domain/ErrorService";
import Axios from "axios-observable";
import { ConfigService } from "@/domain/ConfigService";
import { LoginRequestData } from "@/api/User/LoginRequestData";
import { UserData } from "@/domain/User/UserData";
import { LoginResult } from "@/api/User/LoginResult";
import { ApiUserData } from "@/api/User/ApiUserData";
import { IsActiveDirectoryUserResult } from "@/api/User/IsActiveDirectoryUserResult";
import { AbstractApi, AuthorizationHeader } from "@/api/AbstractApi";
import { UserService } from "@/domain/User/UserService";


export class UserApi {

  constructor(
    private errorService: ErrorService,
    private configService: ConfigService,
  ) {
  }

  public retrieveUserDataByToken(token: string): Observable<UserData | undefined> {
    const url = this.configService.getRestAPIURL() + "/whoami";
    return Axios.get<ApiUserData>(url, { "headers": { "Authorization": token } }).pipe(
      tap(() => {
        //need only error logging
      }, e => {
        console.log(e);
      }),
      map(axiosResponse => {
        let result: UserData | undefined;
        const httpResponseCode = axiosResponse.status;

        switch (httpResponseCode) {

          case 200:
            result = Object.assign({ "id": axiosResponse.data._id }, axiosResponse.data);
            break;

          case 401:
            result = undefined;
            break;

          default:
            result = undefined;
            console.error("Retrieving user data by token failed with unknown response code: " + httpResponseCode + "!");
            break;
        }

        return result;
      })
    );
  }

  public login(loginRequestData: LoginRequestData): Observable<LoginResult> {
    const loginAPIUrl = this.configService.getRestAPIURL() + "/login";
    console.log(loginAPIUrl);
    return Axios.post<ApiUserData>(loginAPIUrl, loginRequestData).pipe(
      tap(() => {
        //need only error logging
      }, e => {
        console.log(e);
      }),
      map(axiosResponse => {
        const result = {} as LoginResult;
        const httpResponseCode = axiosResponse.status;

        switch (httpResponseCode) {
          case 200:
            result.isAuthorized = true;
            result.userData = Object.assign({ "id": axiosResponse.data._id }, axiosResponse.data);
            result.token = axiosResponse.headers.authorization
            break;

          case 401:
            result.isAuthorized = false;
            break;

          default:
            result.isAuthorized = false;
            console.error("Login request failed with unknown response code: " + httpResponseCode + "!");
            break;
        }

        return result;
      }),
      catchError((err) => {
        if (
          err &&
          err.response &&
          err.response.data &&
          err.response.data.message &&
          err.response.data.message.toLowerCase().indexOf("totp") > -1
        ) {
          return of({ isTFAenabled: true } as LoginResult);
        }
        console.error("Login request failed with error: " + err);
        return of({ isAuthorized: false } as LoginResult);
      })
    );
  }

  public listNamespacesByEmail(emailAddress: string): Observable<string[]> {
    const url = this.configService.getRestAPIURL() + "/user/isActiveDirectoryUser?email=" + encodeURIComponent(emailAddress);
    return Axios.get<IsActiveDirectoryUserResult>(url).pipe(
      map(axiosResponse => {
        let result: string[];
        const httpResponseCode = axiosResponse.status;

        switch (httpResponseCode) {
          case 200:
            result = axiosResponse.data.namespaces;
            break;

          default:
            result = [];
            console.error("Login failed with unknown response code: " + httpResponseCode + "!");
            break;
        }

        return result;
      })
    );
  }

  public sendPasswordResetEmail(emailAddress: string): Observable<boolean> {
    const url = this.configService.getRestAPIURL() + "/user/reset/password/email";
    return Axios.post<string[]>(url, { "email": emailAddress }).pipe(
      map(axiosResponse => {
        const httpResponseCode = axiosResponse.status;
        if (httpResponseCode != 200) {
          console.error("password reset failed with unknown response code: " + httpResponseCode + "!");
          return false;
        } else {
          return true;
        }
      }),
      catchError((err) => {
        console.error("Reset password request failed with error: " + err);
        return of(false);
      })
    );
  }

  public recover2FactorAuthentication(secretRecoverKey: string): Observable<boolean> {
    const url = this.configService.getRestAPIURL() + "/totp/recover";
    return Axios.post<string[]>(url, { "recover": secretRecoverKey }).pipe(
      map(axiosResponse => {
        let hasBeenRecoveredSuccessfully: boolean;

        const httpResponseCode = axiosResponse.status;
        switch (httpResponseCode) {
          case 200:
            hasBeenRecoveredSuccessfully = true;
            break;

          case 400:
            hasBeenRecoveredSuccessfully = false;
            break;

          default:
            hasBeenRecoveredSuccessfully = false;
            console.error("recovering 2 factor authentication by secret recover key failed with unknown response code: " + httpResponseCode + "!");
            break;
        }

        return hasBeenRecoveredSuccessfully;
      })
    );
  }

}
