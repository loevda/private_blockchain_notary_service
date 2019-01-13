const { body, validationResult } = require('express-validator/check');
const SHA256 = require('crypto-js/sha256');

class ValidationController {
    constructor(app) {
        this.app = app;
        this.requestValidation();
        this.validate();
    }

    requestValidation() {
        this.app.post("/requestValidation", async (req, res) => {
            res.json({"res": "endpoint available"});
        });
    }

    validate() {
        this.app.post("/validate", async (req, res) => {
            res.json({"res": "endpoint available"});
        });
    }

}

module.exports = (app) => { return new ValidationController(app);}