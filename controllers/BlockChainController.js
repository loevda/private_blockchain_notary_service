const { body, validationResult } = require('express-validator/check');
const SHA256 = require('crypto-js/sha256');
const BlockChainClass = require('../models/BlockChain');
const Block = require('../models/Block');

class BlockChainController {
    constructor(app) {
        this.app = app;
        this.chain = new BlockChainClass();
        this.getBlock();
        this.postBlock();
    }

    getBlock() {
        this.app.get("/stars/:hash", async (req, res) => {
            try {
                let block = await this.chain.getBlock(req.params.hash);
                res.json(block);
            } catch(err) {
                res.json({"error": err.toString()});
            }
        });
    }

    postBlock() {
        this.app.post("/block/", [
            // value must exist
            body('address', 'Missing payload {address}.').exists(),
            body('address', '{address} must be a string.').isString(),
            // value must be an email
            body('star', 'Missing payload {star}.').exists(),
            // value must be at least 3 chars long
        ], async (req, res, next) => {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(422).json({ errors: errors.array() });
            } else {
                try {
                    const block = new Block(req.body);
                    let result = await this.chain.addBlock(block);
                    res.json(JSON.parse(result));
                } catch(err) {
                    res.json({"error": err.toString()});
                }
            }
        });
    }
}

module.exports = (app) => { return new BlockChainController(app);}