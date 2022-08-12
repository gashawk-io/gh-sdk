import { ethers } from "ethers";

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

    async sendTransaction(
        signedTransaction: string | Promise<string>
    ): Promise<ethers.providers.TransactionResponse> {
        const _singedTransaction = await signedTransaction;
        const tx = ethers.utils.parseTransaction(_singedTransaction);

        console.log("SEEEEND");
        //now + 24h hours
        const deadlineEnds = new Date().setHours(new Date().getHours() + 24);
        const simulateGHTx = new Promise((res, rej) => {
            setInterval(() => {});
        });

        return Promise.resolve({
            ...tx,
            from: "0x09c3d8547020a044c4879cD0546D448D362124Ae",
            hash: "",
            confirmations: 1,
            wait: () => {
                console.log("gashawk is handeling this tx");
                return undefined!;
            },
        });
    }
}
