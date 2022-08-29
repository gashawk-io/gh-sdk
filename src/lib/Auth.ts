import { getAuthMessage } from "@corpus-ventures/gashawk-common";
import { ethers } from "ethers";
import LoginFailedException from "../Exceptions/LoginFailedException";
import { AuthClient } from "../http/AuthClient";

export class Auth {
    public static async login(
        signer: ethers.Signer,
        authClient: AuthClient = new AuthClient()
    ) {
        const createdAt = new Date().getTime();

        const messageSignature = await signer.signMessage(
            getAuthMessage(createdAt)
        );

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
}
