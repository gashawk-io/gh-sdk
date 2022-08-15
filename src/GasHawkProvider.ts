import {
    DEADLINE_DURATION_DEFAULT,
    SubmitableTransaction,
} from "@corpus-ventures/gashawk-common";
import { ethers } from "ethers";
import { TransactionClient } from "./http/TransactionClient";
import { v4 as uuidv4 } from "uuid";
import { TransactionStatus } from "./lib/TransactionStatus";

export class GasHawkProvider extends ethers.providers.StaticJsonRpcProvider {
    private token: string;
    constructor(token: string) {
        super(
            `https://eth-mainnet.alchemyapi.io/v2/fORbbzWLRjURSB-DaH1nx0ovkjLn2maI`,
            {
                chainId: 1,
                name: "mainnet",
            }
        );

        this.token = token;
    }

    async getTransactionCount(
        addressOrName: string | Promise<string>,
        blockTag?:
            | ethers.providers.BlockTag
            | Promise<ethers.providers.BlockTag>
            | undefined
    ): Promise<number> {
        console.log("get count");
        const addr = await addressOrName;
        const txCount = await new TransactionClient(
            this.token
        ).getUsersTransactionCount(addr);

        if (txCount === null) {
            throw Error("cant fetch transaction count");
        }

        return txCount;
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
            from: "0x09c3d8547020a044c4879cD0546D448D362124Ae",
            hash: ethers.utils.keccak256(_singedTransaction),
            confirmations: 1,
            wait: async () => {
                return await TransactionStatus.getStatus(id, this.token, this);
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

        await new TransactionClient(this.token).submitTransaction([
            submitableTransaction,
        ]);
    }
}

export interface GashawkOptions {
    simulate?: boolean;
    deadlineDuration?: number;
}
