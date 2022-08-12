import { LoginPayload } from "@corpus-ventures/gashawk-common";
import { BackendClient } from "./BackendClient";

export class AuthClient extends BackendClient {
    private AUTH_PATH = "/auth";

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
