import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import {
    TransactionState,
    TransactionWithFee,
} from "@corpus-ventures/gashawk-common";
import { ethers } from "ethers";
import { TransactionReceipt } from "@ethersproject/abstract-provider";
import { GashawkClient } from "../http/GashawkClient";
dayjs.extend(duration);

export class Status {
    public static async print(
        id: string,
        client: GashawkClient,
        provider: ethers.providers.BaseProvider
    ): Promise<TransactionReceipt> {
        const t = await client.getTransaction(id);
        if (t === null) {
            throw "Cant fetch status";
        }

        if (t.state === TransactionState.Failed) {
            throw `transaction ${id} failed`;
        }

        if (
            t.state === TransactionState.Finalized ||
            t.state === TransactionState.Mined
        ) {
            //TODO Fake receipt when simulated
            return await provider.getTransactionReceipt(t.transactionHash!);
        }
        Status.printStatusWhenPending(t);

        return undefined!;
    }

    private static printStatusWhenPending(t: TransactionWithFee) {
        const now = dayjs(Date.now());
        const deadlineDate = dayjs(t.pendingSince).add(
            t.deadlineDuration,
            "ms"
        );

        const duration = dayjs.duration(deadlineDate.diff(now));
        console.log(
            `The transaction ${t.transactionHash} is handled by GasHawk`
        );
        console.log(`State : ${t.state}`);
        console.log(`Time remaining ${duration.format("HH:mm:ss")}`);
    }
}
