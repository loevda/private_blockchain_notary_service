const { body, validationResult } = require('express-validator/check');
const SHA256 = require('crypto-js/sha256');

class ValidationController {
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
        ], async (req, res) => {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(422).json({ errors: errors.array() });
            }
            res.json(this.mempool.addRequestValidation(req.body.address));
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
            res.json({"res": "endpoint available"});
        });
    }

}

module.exports = (app, mempool) => { return new ValidationController(app, mempool);}