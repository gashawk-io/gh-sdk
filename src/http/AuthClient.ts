import { LoginPayload } from "gashawk-common";
import axios, { Axios } from "axios";

export class AuthClient {
    protected client: Axios;
    private BACKEND_URL = "https://dev.gashawk.io:3000";
    private AUTH_PATH = "/auth";

    constructor() {
        this.client = axios.create({
            baseURL: this.BACKEND_URL,
        });
    }

    public async login(loginPayload: LoginPayload): Promise<string | null> {
        const url = `${this.AUTH_PATH}/login`;
        try {
            const { status, data } = await this.client.post(url, loginPayload);
            if (status !== 200) {
                return null;
            }
            return data;
        } catch (err) {
            console.log(err);
            return null;
        }
    }
}
