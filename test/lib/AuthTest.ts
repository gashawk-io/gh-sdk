import { LoginPayload } from "gashawk-common";
import chai from "chai";
import { Signer } from "ethers";
import { ethers } from "hardhat";
import LoginFailedException from "../../src/Exceptions/LoginFailedException";
import { TermsRejectedException } from "../../src/Exceptions/TermsRejectedException";
import { AuthClient } from "../../src/http/AuthClient";
import { Auth } from "../../src/lib/Auth";

describe("Auth", () => {
    let expect: Chai.ExpectStatic;
    before(() => {
        chai.use(require("chai-as-promised"));
        expect = chai.expect;
    });
    let signer: Signer;

    beforeEach(async () => {
        [signer] = await ethers.getSigners();
    });
    describe("login", () => {
        it("returns token if called login properly and terms are excepted", async () => {
            const expectedToken =
                "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJHYXNIYXdrIiwic3ViIjoiMHhmMzlGZDZlNTFhYWQ4OEY2RjRjZTZhQjg4MjcyNzljZmZGYjkyMjY2IiwiaWF0IjoxNjYwMzI0Nzg1MTkyLCJleHAiOjE2OTE4NjA3ODUzNDgsImp0aSI6IjB4YWM3MDQwMGI3ZWM2OTljZDk1ZGU1NTgzMWJlNWJlN2M0ZGYwNjM2NjI0OTFhNmZhMTU2MDhkNjZiZmEwYmM3OTI4ZDZmODY4MzRmYzAzYTQwZWY2OWFlOWZiN2RkNmE3MDM1MWZhZGE3MjJhMDg1NzUwYWU0ZmUzMWZhNDFkNWExYiIsInJvbGVzIjpbIlVTRVIiXX0.bGqp5-JhBuCmK5bYybjGbeyclsdVz2UgPyRjDtnTdn0";

            const authClientMock = {
                login(_: LoginPayload) {
                    return Promise.resolve(expectedToken);
                },
            } as AuthClient;

            //Waiting a second until we accept th terms
            setTimeout(() => {
                process.stdin.push("yes");
                process.stdin.push("\x0D"); //Enter escape char
            }, 1000);
            const token = await Auth.login(signer, authClientMock);

            expect(token).to.equal(expectedToken);
        });
        it("throws login failed exception if token creation failed", async () => {
            const authClientMock = {
                login(_: LoginPayload) {
                    throw new LoginFailedException();
                },
            } as unknown as AuthClient;

            try {
                //Waiting a second until we accept th terms
                setTimeout(() => {
                    process.stdin.push("yes");
                    process.stdin.push("\x0D"); //Enter escape char
                }, 1000);
                await Auth.login(signer, authClientMock);
                expect.fail("method should have thrown");
            } catch (e) {
                expect(e).to.be.instanceOf(LoginFailedException);
            }
        });
        it("throws terms rejcted exception if user has not accepted terms", async () => {
            const authClientMock = {
                login(_: LoginPayload) {
                    throw new LoginFailedException();
                },
            } as unknown as AuthClient;

            try {
                //Waiting a second until we accept th terms
                setTimeout(() => {
                    process.stdin.push("no");
                    process.stdin.push("\x0D"); //Enter escape char
                }, 1000);
                await Auth.login(signer, authClientMock);
                expect.fail("method should have thrown");
            } catch (e) {
                expect(e).to.be.instanceOf(TermsRejectedException);
            }
        });
    });
});
