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
            //Waiting a second until we accept th terms
            setTimeout(() => {
                process.stdin.push("yes");
                process.stdin.push("\x0D"); //Enter escape char
            }, 1000);
            const gh = await Gashawk.fromSigner(signer, "www.example-rpc.com");

            expect(gh).to.be.instanceOf(Gashawk);
        });
        it("Create new Gashawk instance with token already provided", async () => {
            const token =
                "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJHYXNIYXdrIiwic3ViIjoiMHhmMzlGZDZlNTFhYWQ4OEY2RjRjZTZhQjg4MjcyNzljZmZGYjkyMjY2IiwiaWF0IjoxNjYwMzI0Nzg1MTkyLCJleHAiOjE2OTE4NjA3ODUzNDgsImp0aSI6IjB4YWM3MDQwMGI3ZWM2OTljZDk1ZGU1NTgzMWJlNWJlN2M0ZGYwNjM2NjI0OTFhNmZhMTU2MDhkNjZiZmEwYmM3OTI4ZDZmODY4MzRmYzAzYTQwZWY2OWFlOWZiN2RkNmE3MDM1MWZhZGE3MjJhMDg1NzUwYWU0ZmUzMWZhNDFkNWExYiIsInJvbGVzIjpbIlVTRVIiXX0.bGqp5-JhBuCmK5bYybjGbeyclsdVz2UgPyRjDtnTdn0";

            const gh = await Gashawk.fromSigner(
                signer,
                "www.example-rpc.com",
                token
            );

            expect(gh).to.be.instanceOf(Gashawk);
        });
        it("Throw an exception if the signer has no provider", async () => {
            const signer = Wallet.createRandom();

            try {
                //Waiting a second until we accept th terms
                setTimeout(() => {
                    process.stdin.push("yes");
                    process.stdin.push("\x0D"); //Enter escape char
                }, 1000);
                await Gashawk.fromSigner(signer, "www.example-rpc.com");
                expect.fail("method should have thrown");
            } catch (e) {
                expect(e).to.be.instanceOf(NoProviderException);
            }
        });
    });
});
