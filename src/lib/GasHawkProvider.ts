import {
    DEADLINE_DURATION_DEFAULT,
    SubmitableTransaction,
} from "@corpus-ventures/gashawk-common";
import { ethers, providers } from "ethers";
import { GashawkClient } from "../http/GashawkClient";
import { v4 as uuidv4 } from "uuid";
import { Status } from "./Status";
import { TransactionCount } from "./TransactionCount";
import { GashawkOptions } from "../types";

export class GasHawkProvider extends ethers.providers.StaticJsonRpcProvider {
    private client: GashawkClient;
    constructor(token: string, baseUrl: string) {
        super(baseUrl);
        this.client = new GashawkClient(token);
    }

    async getTransactionCount(
        addressOrName: string | Promise<string>,
        blockTag?:
            | ethers.providers.BlockTag
            | Promise<ethers.providers.BlockTag>
            | undefined
    ): Promise<number> {
        return TransactionCount.get(this.client, await addressOrName);
    }

    async sendTransaction(
        signedTransaction: string | Promise<string>,
        params?: GashawkOptions
    ): Promise<ethers.providers.TransactionResponse> {
        const _singedTransaction = await signedTransaction;
        const tx = ethers.utils.parseTransaction(_singedTransaction);
        const id = uuidv4();
        await this.sendTransactionToGasHawk(
            id,
            _singedTransaction,
            params ?? {}
        );
        return Promise.resolve({
            ...tx,
            from: tx.from!,
            hash: ethers.utils.keccak256(_singedTransaction),
            confirmations: 1,
            wait: async () => {
                return await Status.print(id, this.client, this);
            },
        });
    }

    private async sendTransactionToGasHawk(
        id: string,
        signedTransaction: string,
        params: GashawkOptions
    ) {
        const { deadlineDuration, ...rest } = params;
        const submitableTransaction: SubmitableTransaction = {
            id,
            signedTransaction: signedTransaction,
            requestId: uuidv4(),
            strategy: "harmonic-strategy",
            deadlineDuration: deadlineDuration ?? DEADLINE_DURATION_DEFAULT,
            params: { ...rest },
        };

        await this.client.submitTransaction([submitableTransaction]);
    }
}
