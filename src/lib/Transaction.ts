import { TransactionWithFee } from "@corpus-ventures/gashawk-common";
import { GashawkClient } from "../http/GashawkClient";

export class Transaction {
    public static async getAll(client: GashawkClient): Promise<TransactionWithFee[]> {
        const txs = await client.getTransactions();

        if (txs === null) {
            throw "an error occrured fetching transactions";
        }

        return txs;
    }

    public static async get(client: GashawkClient, id: string) {
        const tx = await client.getTransaction(id);

        if (tx === null) {
            throw `cant fetch tx ${id}`;
        }

        return tx;
    }
}
