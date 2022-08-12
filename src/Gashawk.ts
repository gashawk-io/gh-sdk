import {
    getAuthMessage,
    TransactionWithFee,
} from "@corpus-ventures/gashawk-common";
import { ethers, Wallet } from "ethers";
import { GasHawkProvider } from "./GasHawkProvider";
import { AuthClient } from "./http/AuthClient";
import { TransactionClient } from "./http/TransactionClient";

export class Gashawk {
    private signer: ethers.Signer;
    private transactionClient: TransactionClient;
    private gashawkProvider: GasHawkProvider;

    constructor(signer: ethers.Signer, token: string) {
        this.signer = signer;
        this.transactionClient = new TransactionClient(token);
        this.gashawkProvider = new GasHawkProvider(token);
    }

    public getProvider() {
        return this.gashawkProvider;
    }

    public getSinger(): ethers.Signer {
        return this.signer.connect(this.gashawkProvider);
    }

    static async fromSigner(signer: ethers.Signer): Promise<Gashawk> {
        const token = await Gashawk.login(signer);
        return new Gashawk(signer, token);
    }

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

    public async getTransactions(): Promise<TransactionWithFee[]> {
        const txs = await this.transactionClient.getTransactions();

        if (txs === null) {
            throw "an error occrured fetching transactions";
        }

        return txs;
    }
}
