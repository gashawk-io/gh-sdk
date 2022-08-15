import { getAuthMessage } from "@corpus-ventures/gashawk-common";
import { ethers } from "ethers";
import { AuthClient } from "../http/AuthClient";

export class Auth {
    public static async login(signer: ethers.Signer) {
        const createdAt = new Date().getTime();

        const messageSignature = await signer.signMessage(
            getAuthMessage(createdAt)
        );

        const newSessionJwt = await new AuthClient().login({
            createdAt,
            messageSignature,
            publicKey: await signer.getAddress(),
        });

        if (newSessionJwt === null) {
            throw "login failed";
        }

        return newSessionJwt;
    }
}
