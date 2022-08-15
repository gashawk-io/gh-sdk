import {
    SubmitableTransaction,
    TransactionSummaryData,
    TransactionWithFee,
} from "@corpus-ventures/gashawk-common";
import { BackendClient } from "./BackendClient";

export class TransactionClient extends BackendClient {
    private TRANSACTION_VIEW_PATH = "/view/tx";
    private SUBMIT_PATH = "/submit";
    private token: string;

    constructor(token: string) {
        super();
        this.token = token;
    }

    private getAuth() {
        return {
            headers: {
                Authorization: `Bearer ${this.token}`,
            },
        };
    }
    public async getTransactions(): Promise<TransactionWithFee[] | null> {
        const url = `${this.TRANSACTION_VIEW_PATH}/userTransactions`;
        try {
            const { data } = await this.client.get(url, this.getAuth());
            return data as TransactionWithFee[];
        } catch (err) {
            console.log(err);
            return null;
        }
    }

    public async getTransaction(
        id: string
    ): Promise<TransactionWithFee | null> {
        const url = `${this.TRANSACTION_VIEW_PATH}/userTransactionById/${id}`;
        try {
            const { data } = await this.client.get(url, this.getAuth());
            return data as TransactionWithFee;
        } catch (err) {
            console.log(err);
            return null;
        }
    }

    public async submitTransaction(
        submitableTransactions: SubmitableTransaction[]
    ): Promise<boolean> {
        //TODO refactor backend path when implementation is known
        const url = this.SUBMIT_PATH;
        try {
            const { data, status } = await this.client.post(
                url,
                submitableTransactions,
                this.getAuth()
            );

            const [{ hasError, value }] = data;
            if (hasError) {
                throw Error(value);
            }
            return true;
        } catch (err) {
            console.error(err);
            throw new Error("cannot submit transaction to gashawk");
        }
    }

    public async getUsersTransactionCount(
        from: string
    ): Promise<number | null> {
        try {
            const url = `/status/transactionCount/${from}`;
            const { status, data } = await this.client.get(url, this.getAuth());
            if (status !== 200) {
                throw new Error("Cant get users transaction count");
            }

            return data.transactionCount as number;
        } catch (e) {
            console.error(e);
            throw new Error("Cant get users transaction count");
        }
    }
}
