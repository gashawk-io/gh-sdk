import {
    DEADLINE_DURATION_DEFAULT,
    getAuthMessage,
    TransactionWithFee,
} from "@corpus-ventures/gashawk-common";
import {
    TransactionRequest,
    TransactionResponse,
} from "@ethersproject/abstract-provider";
import { ethers, logger } from "ethers";
import { Deferrable, shallowCopy } from "ethers/lib/utils";
import { GasHawkProvider } from "./GasHawkProvider";
import { AuthClient } from "./http/AuthClient";
import { TransactionClient } from "./http/TransactionClient";

export class Gashawk {
    private signer: ethers.Signer;
    private transactionClient: TransactionClient;
    private gashawkProvider: GasHawkProvider;

    constructor(
        signer: ethers.Signer,
        token: string,
        defaultDeadlineDuration: number
    ) {
        this.signer = signer;
        this.transactionClient = new TransactionClient(token);
        this.gashawkProvider = new GasHawkProvider(token);
    }

    static async fromSigner(signer: ethers.Signer): Promise<Gashawk> {
        const token = await Gashawk.login(signer);
        return new Gashawk(signer, token, DEADLINE_DURATION_DEFAULT);
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
    public getProvider() {
        return this.gashawkProvider;
    }

    public getSinger(): ethers.Signer {
        const instance = this.signer.connect(this.gashawkProvider);

        instance.sendTransaction = async (
            transaction: Deferrable<TransactionRequest>
        ): Promise<TransactionResponse> => {
            instance._checkProvider("sendTransaction");
            const tx = await instance.populateTransaction(transaction);
            const signedTx = await instance.signTransaction(tx);
            const customData = await transaction.customData;

            const simulate = customData?.simulate ?? false;

            return await this.gashawkProvider.sendTransaction(signedTx, {
                simulate,
            });
        };

        return instance;
    }

    public async getTransactions(): Promise<TransactionWithFee[]> {
        const txs = await this.transactionClient.getTransactions();

        if (txs === null) {
            throw "an error occrured fetching transactions";
        }

        return txs;
    }
}
