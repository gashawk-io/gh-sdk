import { GashawkClient } from "../http/GashawkClient";

export class TransactionCount {
    public static async get(client: GashawkClient, address: string) {
        const txCount = await client.getUsersTransactionCount(address);

        if (txCount === null) {
            throw Error("cant fetch transaction count");
        }
        return txCount;
    }
}
