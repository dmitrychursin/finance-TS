export type RefreshResponseType = {
    error: boolean,
    tokens: {
        accessToken?: string,
        refreshToken?: string,
    }
    message: string
}