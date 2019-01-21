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
        this.getBlocksByAddress();
        this.getBlockByHeight();
        this.postBlock();
    }

    getBlockByHeight() {
        this.app.get("/block/:height", async (req, res, next) => {
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

    getBlocksByAddress() {
        this.app.get("/stars/address/:address", async (req, res, next) => {
            try {
                let blocks = await this.chain.getBlockByWalletAddress(req.params.address);
                let stars = blocks.map((el) => {
                    el.body.star.storyDecoded = hex2ascii(el.body.star.story);
                    return el;
                });
                res.json(stars);
            } catch(err) {
                next(err);
            }
        });
    }

    postBlock() {
        this.app.post("/block/", [
            // value must exist
            body('address', 'Missing payload {address}.').exists(),
            body('star', 'Missing payload {star}').exists(),
            body('star.dec', 'Missing payload {star.dec}').exists(),
            body('star.ra', 'Missing payload {star.dec}').exists(),
            body('star.story', 'Missing payload {star.story}').exists(),
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
                            const star = req.body.star;
                            star.story = Buffer.from(star.story).toString('hex');
                            const body = {
                                address: req.body.address,
                                star: {...star}
                            };
                            const block = new Block(body);
                            let starBlock = await this.chain.addBlock(block);
                            let result = JSON.parse(starBlock);
                            result.body.star.storyDecoded = hex2ascii(result.body.star.story);
                            await this.mempool.removeStarFromPool(req.body.address);
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


