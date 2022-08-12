import {
    TransactionSummaryData,
    TransactionWithFee,
} from "@corpus-ventures/gashawk-common";
import { BackendClient } from "./BackendClient";

export class TransactionClient extends BackendClient {
    private TRANSACTION_VIEW_PATH = "/view/tx";
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
}
