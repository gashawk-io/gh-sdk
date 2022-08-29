import { Gashawk } from "../src/Gashawk";
import { ethers } from "hardhat";
import { Signer, Wallet } from "ethers";
import { expect } from "chai";
import { NoProviderException } from "../src/Exceptions/NoProviderException";

describe("Gashawk Test", () => {
    let signer: Signer;

    beforeEach(async () => {
        [signer] = await ethers.getSigners();
    });
    describe("constructor", () => {
        it("Create new Gashawk instance when provider is defined", async () => {
            expect(
                async () =>
                    await Gashawk.fromSigner(signer, "www.example-rpc.com")
            ).to.not.throw;
        });
        it("Throw an exception if the signer has no provider", async () => {
            const signer = Wallet.createRandom();

            expect(
                async () =>
                    await Gashawk.fromSigner(signer, "www.example-rpc.com")
            ).to.throw;
        });
    });
});
