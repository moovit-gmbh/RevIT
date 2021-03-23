export interface LoginRequestData {
    email: string,
    password: string,
    totp: string | undefined,
    namespace: string | undefined
}
