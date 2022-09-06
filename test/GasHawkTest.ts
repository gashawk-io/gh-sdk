import { Gashawk } from "../src/Gashawk";
import { ethers } from "hardhat";
import { Signer, Wallet } from "ethers";
import { expect } from "chai";
import { NoProviderException } from "../src/Exceptions/NoProviderException";
import exp from "constants";


describe("Gashawk Test", () => {
    let signer: Signer;

    beforeEach(async () => {
        [signer] = await ethers.getSigners();
    });
    describe("constructor", () => {
        it("Create new Gashawk instance when provider is defined", async () => {
            const gh = await Gashawk.fromSigner(signer, "www.example-rpc.com");
            expect(gh).to.be.instanceOf(Gashawk);
        });
        it("Throw an exception if the signer has no provider", async () => {
            const signer = Wallet.createRandom();

            try {
                await Gashawk.fromSigner(signer, "www.example-rpc.com");
                expect.fail("method should have thrown");
            } catch (e) {
                expect(e).to.be.instanceOf(NoProviderException);
            }
        });
    });
});
