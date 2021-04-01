import { UserData } from "@/domain/User/UserData";

export interface LoginResult {
    "isAuthorized": boolean;

    // if isAuthorized == false, then userData is undefined
    "userData": undefined | UserData;

    // if isAuthorized == false, then token is undefined
    "token": undefined | string;

    "isTFAenabled": undefined | boolean;
}
