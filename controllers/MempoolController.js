const { body, validationResult } = require('express-validator/check');
const SHA256 = require('crypto-js/sha256');

class MempoolController {
    constructor(app, mempool) {
        this.app = app;
        this.mempool = mempool;
        this.requestValidation();
        this._getTimeouts();
        this.validate();
    }

    _getTimeouts() {
        this.app.get('/timeouts', async (req, res) => {
            res.json({"ts": this.mempool.timeoutRequests});
        })
    }

    requestValidation() {
        this.app.post("/requestValidation", [
            body('address', 'Missing payload {address}.').exists(),
            body('address', '{address} must be a string.').isString()
        ], async (req, res) => {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(422).json({ errors: errors.array() });
            }
            const result = await this.mempool.addRequestValidation(req.body.address);
            res.json(result);
        });
    }

    validate() {
        this.app.post("/validate", [
            body('address', 'Missing payload {address}.').exists(),
            body('address', '{address} must be a string.').isString(),
            body('signature', 'Missing payload {signature}.').exists(),
            body('signature', '{signature} must be a string.').isString(),
        ], async (req, res) => {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(422).json({ errors: errors.array() });
            }
            let result = await this.mempool.validateRequestByWallet(req.body.message, req.body.address, req.body.signature)
            console.log(this.mempool.pool);
            res.json(result);
        });
    }

}

module.exports = (app, mempool) => { return new MempoolController(app, mempool);}