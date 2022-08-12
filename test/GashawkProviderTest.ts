import { expect } from "chai";
import { Signer, Wallet } from "ethers";
import { deployments, ethers } from "hardhat";

import { NFTToken, NFTToken__factory } from "../typechain";
import { GasHawkProvider } from "../src/GasHawkProvider";
import { Gashawk } from "../src/Gashawk";

describe("GasHawk provider test ", function () {
    it.only("sdk test", async () => {
        const [signer] = await ethers.getSigners();

        const gh = await Gashawk.fromSigner(signer);

        const txs = await gh.getTransactions();
    });

    it("test", async () => {
        const [donator] = await ethers.getSigners();
        const { privateKey, address } = Wallet.createRandom();

        await donator.sendTransaction({
            to: address,
            value: ethers.utils.parseEther("1"),
            gasLimit: 21000,
        });

        const ghProvider = new GasHawkProvider("");
        const signer = new Wallet(privateKey, ghProvider);

        signer.connect(ghProvider);

        const x = await signer.sendTransaction({
            to: await donator.getAddress(),
            value: 1,
            gasLimit: 21000,
        });

        console.log(x);
        console.log(await x.wait());
    });
});
