/**
 * Created by david2099 on 20/01/19.
 */
class MemPoolError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
    }
}

module.exports = MemPoolError;