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
import { NoProviderException } from "./Exceptions/NoProviderException";

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
        try {
            signer._checkProvider();
        } catch (err) {
            throw new NoProviderException();
        }
        this.gashawkProvider = new GasHawkProvider(token, baseUrl);
    }
    /**
     * Creates an instance of the GasHawk SDK based on  ethers Signer class.
     * If no token is provided, GasHawk will create a new session based on your account
     * @params signer The signer that you want to do transaction with.
     * @params baseUrl baseUrl of a web3Provider.
     * @params token A GasHawk Session token.
     */
    static async fromSigner(
        signer: ethers.Signer,
        baseUrl: string,
        token?: string | undefined
    ): Promise<Gashawk> {
        const _token = token ?? (await Auth.login(signer));
        const { defaultDeadlineDuration } = await new GashawkClient(
            _token
        ).getUserSettings(await signer.getAddress());
        this.logTokenLink(_token);
        return new Gashawk(signer, _token, defaultDeadlineDuration, baseUrl);
    }
    /**
     * Returns an instance of the Web3 Provider. Note that this instance does intercepts "getTransactionCount" and "sendTransaction"
     */
    public getProvider() {
        return this.gashawkProvider;
    }
    /**
     * Returns an instance of the Ethers signer. This instance can be used to Send Ether or be passed to ethers.Contract or ethers.ContractFactory. When this Signer is used transactions will be sent to GasHawk instead to the public mempool
     */
    public getSigner(): ethers.Signer {
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
    /**
     * Returns all transactions that are managed by GasHawk
     */
    public async getAllTransactions(): Promise<TransactionWithFee[]> {
        return await Transaction.getAll(this.client);
    }
    /**
     * Returns a transaction
     * @params id the transaction id
     */
    public async getTransaction(id: string): Promise<TransactionWithFee> {
        return await Transaction.get(this.client, id);
    }
    /**
     * Use this function to block the process until the transaction was processed by GasHawk.
     * @params tx ethers.TransactionResponse
     */
    public wait(tx: ethers.providers.TransactionResponse) {
        return new Promise((res, _) => {
            const timeout = setTimeout(() => {}, 86400000);
            setInterval(async () => {
                const finish = await tx.wait();
                if (finish !== undefined) {
                    console.log("Transaction is now mined");
                    clearTimeout(timeout);
                    res(undefined);
                }
            }, 1000);
        });
    }
    private static logTokenLink(token: string) {
        const link = `https://dev-fe.gashawk.io/#/token?jwt=${token}`;

        console.log(
            "Open the link to see your transaction in the GasHawk Web App \n"
        );
        console.log(link);
        console.log("\n");
    }
}
