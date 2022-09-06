import {
    getAuthMessage,
    getTermsOfService,
} from "@corpus-ventures/gashawk-common";
import { ethers } from "ethers";
import LoginFailedException from "../Exceptions/LoginFailedException";
import { AuthClient } from "../http/AuthClient";
import { createInterface } from "readline";
import { TermsRejectedException } from "../Exceptions/TermsRejectedException";
export class Auth {
    public static async login(
        signer: ethers.Signer,
        authClient: AuthClient = new AuthClient()
    ) {
        const createdAt = new Date().getTime();
        const authMessage = getAuthMessage(createdAt);

        if (!(await this.promtTermsOfService())) {
            throw new TermsRejectedException();
        }

        const messageSignature = await signer.signMessage(authMessage);

        const newSessionJwt = await authClient.login({
            createdAt,
            messageSignature,
            publicKey: await signer.getAddress(),
        });

        if (newSessionJwt === null) {
            throw new LoginFailedException();
        }

        return newSessionJwt;
    }

    private static async promtTermsOfService(): Promise<boolean> {
        const terms = getTermsOfService();
        console.log(terms);
        console.log("\n");

        const rl = createInterface({
            input: process.stdin,
            output: process.stdout,
        });

        return new Promise((res) => {
            rl.question(
                "Do you accept the Terms of Service ? Press y or yes",
                (input: string) => {
                    if (
                        input.toLowerCase() === "y" ||
                        input.toLowerCase() === "yes"
                    ) {
                        return res(true);
                    }
                    rl.close();
                    return res(false);
                }
            );
        });
    }
}
