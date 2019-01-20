const { body, validationResult } = require('express-validator/check');
const SHA256 = require('crypto-js/sha256');
const BlockChainClass = require('../models/BlockChain');
const Block = require('../models/Block');
const hex2ascii = require('hex2ascii');

class BlockChainController {
    constructor(app, mempool) {
        this.app = app;
        this.mempool = mempool;
        this.chain = new BlockChainClass();
        this.getBlockByHash();
        this.getBlockByAddress();
        this.getBlockByHeight();
        this.postBlock();
    }

    getBlockByHeight() {
        this.app.get("/stars/height/:height", async (req, res) => {
            try {
                let block = await this.chain.getBlock(req.params.height);
                block.body.star.storyDecoded = hex2ascii(block.body.star.story);
                res.json(block);
            } catch(err) {
                res.json({"error": err.toString()});
            }
        });
    }

    getBlockByHash() {
        this.app.get("/stars/hash/:hash", async (req, res) => {
            try {
                let block = await this.chain.getBlockByHash(req.params.hash);
                block.body.star.storyDecoded = hex2ascii(block.body.star.story);
                res.json(block);
            } catch(err) {
                res.json({"error": err.toString()});
            }
        });
    }

    getBlockByAddress() {
        this.app.get("/stars/address/:address", async (req, res) => {
            try {
                let block = await this.chain.getBlockByWalletAddress(req.params.address);
                block.body.star.storyDecoded = hex2ascii(block.body.star.story);
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
            body('dec', 'Missing payload {dec}.').exists(),
            body('dec', '{dec} must be a string.').isString(),
            body('ra', 'Missing payload {ra}.').exists(),
            body('ra', '{ra} must be a string.').isString(),
            body('story', 'Missing payload {story}.').exists(),
            body('story', '{story} must be a string.').isString()
            // value must be at least 3 chars long
        ], async (req, res, next) => {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(422).json({ errors: errors.array() });
            } else {
                try {
                    //check if valid first with mempool
                        let isValid = await this.mempool.verifyAddressRequest(req.body.address);
                        if (isValid) {
                            //then post to the blockchain
                            const body = {
                                address: req.body.address,
                                star: {
                                    dec: req.body.dec,
                                    ra: req.body.ra,
                                    story: Buffer(req.body.story).toString('hex')
                                }
                            }
                            const block = new Block(body);
                            let result = await this.chain.addBlock(block);
                            //result.body.star.storyDecoded = hex2ascii(result.body.star.story);
                            res.json(JSON.parse(result));
                        }
                } catch(err) {
                    res.json({"error": err.toString()});
                }
            }
        });
    }
}

module.exports = (app, mempool) => { return new BlockChainController(app, mempool);}