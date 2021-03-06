//Importing Express.js module
const express = require("express");
//Importing BodyParser.js module
const bodyParser = require("body-parser");
const Mempool = require('./utils/Mempool');

/**
 * Class Definition for the REST API
 */
class APIServer {

    /**
     * Constructor that allows initialize the class
     */
    constructor() {
        this.app = express();
        this.mempool = new Mempool();
        this.initExpress();
        this.initExpressMiddleWare();
        this.getInfo();
        this.initControllers();
        this.start();
    }

    /**
     * Initilization of the Express framework
     */
    initExpress() {
        this.app.set("port", 8000);
    }

    /**
     * Initialization of the middleware modules
     */
    initExpressMiddleWare() {
        this.app.use(bodyParser.urlencoded({extended:true}));
        this.app.use(bodyParser.json());
    }

    /**
     * Default route
     */
    getInfo() {
        this.app.get("/", (req, res) => {
            res.json({
                endpoints: [
                    {
                        "/requestValidation": {
                            method: "POST",
                            description: "Validate an address",
                            payload: {"address": "address_goes_here"}
                        }
                    },
                    {
                        "/message-signature/validate": {
                            method: "POST",
                            description: "",
                            payload: {"address": "address_goes_here", "signature": "signature goes here"}
                        }
                    },
                    {
                        "/block": {
                            method: "POST",
                            description: "Add a new block to the blockchain .",
                            payload: {"address": "adress_here", "star": { "dec": "dec_goes_here", "ra": "ra_goes_here", "story": "story_goes_here"}}
                        }
                    },
                    {
                        "/stars/hash/[hash]": {
                            method: "GET",
                            param: "{hash} hash of the star block",
                            description: "Return the star block with hash of {hash} as a JSON object."
                        }
                    },
                    {
                        "/stars/address/[address]": {
                            method: "GET",
                            param: "{address} address of the star block",
                            description: "Return the star block with address of {address} as a JSON object."
                        }
                    },
                    {
                        "/block/[height]": {
                            method: "GET",
                            param: "{height} height of the star block",
                            description: "Return the star block with height of {height} as a JSON object."
                        }
                    },
                ]
            })
        });
    }

    /**
     * Initilization of all the controllers
     */
    initControllers() {
        require("./controllers/MempoolController.js")(this.app, this.mempool);
        require("./controllers/BlockChainController.js")(this.app, this.mempool);
        require("./controllers/ErrorController.js")(this.app);
    }

    /**
     * Starting the REST Api application
     */
    start() {
        let self = this;
        this.app.listen(this.app.get("port"), () => {
            console.log(`Server Listening for port: ${self.app.get("port")}`);
        });
    }

}

new APIServer();