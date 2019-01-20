const { body, validationResult } = require('express-validator/check');
const SHA256 = require('crypto-js/sha256');

class MempoolController {
    constructor(app, mempool) {
        this.app = app;
        this.mempool = mempool;
        this.requestValidation();
        this.validate();
    }

    requestValidation() {
        this.app.post("/requestValidation", [
            body('address', 'Missing payload {address}.').exists(),
            body('address', '{address} must be a string.').isString()
        ], async (req, res , next) => {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(422).json({ errors: errors.array() });
            }
            try {
                const result = await this.mempool.addRequestValidation(req.body.address);
                res.json(result);
            }catch(err){
                next(err);
            }
        });
    }

    validate() {
        this.app.post("/validate", [
            body('address', 'Missing payload {address}.').exists(),
            body('address', '{address} must be a string.').isString(),
            body('signature', 'Missing payload {signature}.').exists(),
            body('signature', '{signature} must be a string.').isString(),
        ], async (req, res, next) => {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(422).json({ errors: errors.array() });
            }
            try {
                let result = await this.mempool.validateRequestByWallet(req.body.message,
                    req.body.address, req.body.signature);
                res.json(result);
            }catch(err){
                next(err);
            }
        });
    }

}

module.exports = (app, mempool) => { return new MempoolController(app, mempool);}