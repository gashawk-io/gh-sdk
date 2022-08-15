import { TransactionClient } from "src/http/TransactionClient";

export class TransactionCount {
    public static async get(client: TransactionClient, address: string) {
        const txCount = await client.getUsersTransactionCount(address);

        if (txCount === null) {
            throw Error("cant fetch transaction count");
        }
        return txCount;
    }
}
