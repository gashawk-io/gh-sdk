import {
    LoginPayload,
    SubmitableTransaction,
    TransactionWithFee,
    UserSettings,
    USER_SETTINGS_DEFAULT,
} from "@corpus-ventures/gashawk-common";
import axios, { Axios } from "axios";

export class GashawkClient {
    private TRANSACTION_VIEW_PATH = "/view/tx";
    private SUBMIT_PATH = "/submit";
    private SETTINGS_PATH = "/user/settings";

    private token: string;
    private BACKEND_URL = "https://dev.gashawk.io:3000";
    protected client: Axios;

    constructor(token: string) {
        this.client = axios.create({
            baseURL: this.BACKEND_URL,
        });
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

    public async getUserSettings(user: string): Promise<UserSettings> {
        const url = `${this.SETTINGS_PATH}`;
        try {
            const { data } = await this.client.get(url, {
                params: { user },
                ...this.getAuth(),
            });
            return data;
        } catch (err) {
            console.log(err);
            return USER_SETTINGS_DEFAULT;
        }
    }
}
