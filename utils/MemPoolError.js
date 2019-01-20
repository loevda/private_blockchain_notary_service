/**
 * Created by david2099 on 20/01/19.
 */
class MemPoolError extends Error {
    constructor(message, status) {
        super(message);
        this.status = status;
    }
}

module.exports = MemPoolError;