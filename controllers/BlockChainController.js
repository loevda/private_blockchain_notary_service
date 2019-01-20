const { body, validationResult } = require('express-validator/check');
const SHA256 = require('crypto-js/sha256');
const BlockChainClass = require('../utils/BlockChain');
const Block = require('../utils/Block');
const hex2ascii = require('hex2ascii');
const MempoolError = require('../utils/MemPoolError')

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
        this.app.get("/stars/height/:height", async (req, res, next) => {
            try {
                let block = await this.chain.getBlock(req.params.height);
                block.body.star.storyDecoded = hex2ascii(block.body.star.story);
                res.json(block);
            } catch(err) {
                next(err);
            }
        });
    }

    getBlockByHash() {
        this.app.get("/stars/hash/:hash", async (req, res, next) => {
            try {
                let block = await this.chain.getBlockByHash(req.params.hash);
                block.body.star.storyDecoded = hex2ascii(block.body.star.story);
                res.json(block);
            } catch(err) {
                next(err);
            }
        });
    }

    getBlockByAddress() {
        this.app.get("/stars/address/:address", async (req, res, next) => {
            try {
                let block = await this.chain.getBlockByWalletAddress(req.params.address);
                block.body.star.storyDecoded = hex2ascii(block.body.star.story);
                res.json(block);
            } catch(err) {
                next(err);
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
                                    story: Buffer.from(req.body.story).toString('hex')
                                }
                            }
                            const block = new Block(body);
                            let starBlock = await this.chain.addBlock(block);
                            let result = JSON.parse(starBlock);
                            result.body.star.storyDecoded = hex2ascii(result.body.star.story);
                            await this.mempool.removeStarFromPool(req.body.address);
                            console.log(await this.mempool.pool);
                            res.json(result);
                        }else{
                            throw new MempoolError("Unauthorized", 401)
                        }
                } catch(err) {
                    next(err);
                }
            }
        });
    }
}

module.exports = (app, mempool) => { return new BlockChainController(app, mempool);}