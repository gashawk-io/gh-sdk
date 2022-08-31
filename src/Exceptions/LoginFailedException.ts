export default class LoginFailedException extends Error {
    constructor() {
        super("Login failded");
    }
}
