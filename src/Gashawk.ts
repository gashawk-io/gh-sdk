import { TransactionWithFee } from "@corpus-ventures/gashawk-common";
import {
    TransactionRequest,
    TransactionResponse,
} from "@ethersproject/abstract-provider";
import { ethers } from "ethers";
import { Deferrable } from "ethers/lib/utils";
import { GasHawkProvider } from "./lib/GasHawkProvider";
import { GashawkClient } from "./http/GashawkClient";
import { Auth } from "./lib/Auth";
import { Transaction } from "./lib/Transaction";

export class Gashawk {
    private signer: ethers.Signer;
    private client: GashawkClient;
    private gashawkProvider: GasHawkProvider;
    public deadlineDuration: number;

    constructor(
        signer: ethers.Signer,
        token: string,
        defaultDeadlineDuration: number,
        baseUrl: string
    ) {
        this.signer = signer;
        this.client = new GashawkClient(token);
        this.deadlineDuration = defaultDeadlineDuration;

        //A signer without a provider is not supported
        signer._checkProvider();

        this.gashawkProvider = new GasHawkProvider(token, baseUrl);
    }

    static async fromSigner(
        signer: ethers.Signer,
        baseUrl: string
    ): Promise<Gashawk> {
        const token = await Auth.login(signer);
        const { defaultDeadlineDuration } = await new GashawkClient(
            token
        ).getUserSettings(await signer.getAddress());

        return new Gashawk(signer, token, defaultDeadlineDuration, baseUrl);
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
            const deadlineDuration =
                customData?.deadlineDuration ?? this.deadlineDuration;

            return await this.gashawkProvider.sendTransaction(signedTx, {
                simulate,
                deadlineDuration,
            });
        };

        return instance;
    }

    public async getAllTransactions(): Promise<TransactionWithFee[]> {
        return await Transaction.getAll(this.client);
    }

    public async getTransaction(id: string): Promise<TransactionWithFee> {
        return await Transaction.get(this.client, id);
    }
}
