export class TermsRejectedException extends Error {
    constructor() {
        super(
            "You need to accept the terms of service in order to use GasHawk"
        );
    }
}
