//Importing Express.js module
const express = require("express");
//Importing BodyParser.js module
const bodyParser = require("body-parser");

/**
 * Class Definition for the REST API
 */
class APIServer {

    /**
     * Constructor that allows initialize the class
     */
    constructor() {
        this.app = express();
        this.initExpress();
        this.initExpressMiddleWare();
        this.getInfo();
        // this.initControllers();
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
                        "/requestValidation/": {
                            method: "POST",
                            description: "Validate an address",
                            payload: "{\"address\": \"address_goes_here\"}"
                        }
                    },
                    {
                        "/message-signature/validate/": {
                            method: "POST",
                            description: "",
                            payload: "address and signature in body"
                        }
                    },
                    {
                        "/stars/[hash]": {
                            method: "GET",
                            param: "{hash} hash of the star block",
                            description: "Return the star block with hash of {hash} as a JSON object."
                        }
                    },
                ]
            })
        });
    }

    /**
     * Initilization of all the controllers
     */
    // initControllers() {
    //     require("./controllers/BlockChainController.js")(this.app);
    //     require("./controllers/ErrorController.js")(this.app);
    // }

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