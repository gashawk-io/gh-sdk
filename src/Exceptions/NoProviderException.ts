export class NoProviderException extends Error {
    constructor() {
        super("Invalid signer. The signer needs to have a provider attached in order to work properly");
    }
}
