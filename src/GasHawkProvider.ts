import {
    DEADLINE_DURATION_DEFAULT,
    SubmitableTransaction,
} from "@corpus-ventures/gashawk-common";
import { ethers } from "ethers";
import { TransactionClient } from "./http/TransactionClient";
import { v4 as uuidv4 } from "uuid";

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
        signedTransaction: string | Promise<string>
    ): Promise<ethers.providers.TransactionResponse> {
        const _singedTransaction = await signedTransaction;
        const tx = ethers.utils.parseTransaction(_singedTransaction);

        await this.sendTransactionToGasHawk(_singedTransaction);

        return Promise.resolve({
            ...tx,
            from: "0x09c3d8547020a044c4879cD0546D448D362124Ae",
            hash: ethers.utils.keccak256(_singedTransaction),
            confirmations: 1,
            wait: () => {
                console.log("gashawk is handeling this tx");
                return undefined!;
            },
        });
    }

    private async sendTransactionToGasHawk(signedTransaction: string) {
        const submitableTransaction: SubmitableTransaction = {
            id: uuidv4(),
            signedTransaction: signedTransaction,
            requestId: uuidv4(),
            strategy: "harmonic-strategy",
            //TODO impl fetch
            deadlineDuration: DEADLINE_DURATION_DEFAULT,
        };

      await new TransactionClient(this.token).submitTransaction([
            submitableTransaction,
        ]); 
    }
}
