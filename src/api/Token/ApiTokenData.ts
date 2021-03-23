export interface ApiTokenData {
    "rights": (/*"VIEW" | */"COMMENT" | "APPROVAL" | "DOWNLOAD"/* | "MODIFY" | "SHARE" | "DELETE"*/)[],
    "viewCounter": number,
    "maxViews": number,
    "expiringDate": string,
    "email": string,
    "token": string,
    "jobId": string,
    "active": true,
    "domain": string
    _id: string
}
