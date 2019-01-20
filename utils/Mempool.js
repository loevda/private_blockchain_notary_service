const bitcoinMessage = require('bitcoinjs-message');
const MempoolError = require('./MemPoolError');

class Mempool {

    constructor() {
        this.pool = [];
        this.timeoutRequests = [];
        this.timeoutRequestsWindowTime = 5*60*1000;
        this.timeoutValidWindowTime = 30*60*1000;
    }

    addRequestValidation(walletAddress) {

        if (this.pool[walletAddress] !== undefined)
            throw new MempoolError("You already have a pending authorization " +
                "to post a star in the mempool", 409);

        const self = this;
        const requestTimeStamp = new Date().getTime();
        if (this.timeoutRequests[walletAddress] === undefined) {
            this.timeoutRequests[walletAddress] = [requestTimeStamp,
                setTimeout(function() { self._removeValidationRequest(walletAddress) },
                    self.timeoutRequestsWindowTime)];
        }
        return {
            "walletAddress": walletAddress,
            "requestTimeStamp": this.timeoutRequests[walletAddress][0],
            "message": `${walletAddress}:${this.timeoutRequests[walletAddress][0]}:starRegistry`,
            "validationWindow": Math.round(this._calculateValidationWindow(this.timeoutRequests[walletAddress][0], this.timeoutRequestsWindowTime)/1000)
        }
    }

    validateRequestByWallet(walletAddress, signature) {

        if (this.pool[walletAddress] !== undefined) {
            let obj = this.pool[walletAddress][0];
            obj.status.validationWindow = Math.round(this._calculateValidationWindow(
                parseInt(obj.status.requestTimeStamp), this.timeoutValidWindowTime)/1000);
            return obj;
        }

        const self = this;

        let timeOutReq = this.timeoutRequests[walletAddress];
        let isValid = timeOutReq !== undefined && bitcoinMessage.verify(`${walletAddress}:${timeOutReq[0]}:starRegistry`, walletAddress, signature);

        if (isValid) {
            const requestTimeStamp = new Date().getTime();
            const validationWindow = Math.round(this._calculateValidationWindow(requestTimeStamp,
                    this.timeoutValidWindowTime)/1000);
            let respObj =  {
                "registerStar": true,
                "status": {
                    "address": walletAddress,
                    "requestTimeStamp": requestTimeStamp,
                    "message": `${walletAddress}:${requestTimeStamp}:starRegistry`,
                    "validationWindow": validationWindow,
                    "messageSignature": true
                }
            }
            this.pool[walletAddress] = [respObj,
                setTimeout(function() { self._removeValidRequest(walletAddress) },
                    self.timeoutValidWindowTime)];
            this._removeValidationRequest(walletAddress);
            return respObj;
        }else{
            throw new MempoolError("Not authorized", 401);
        }

    }

    verifyAddressRequest(walletAddress) {
        return this.pool[walletAddress] !== undefined;
    }

    removeStarFromPool(walletAddress) {
        this._removeValidRequest(walletAddress);
    }

    _calculateValidationWindow(requestTimeStamp, windowTime) {
        return (windowTime - (new Date().getTime() - requestTimeStamp));
    }

    _removeValidRequest(walletAddress) {
        this.pool = this.pool.filter((el) => {
            return el !== walletAddress;
        })
    }

    _removeValidationRequest(walletAddress) {
        this.timeoutRequests = this.timeoutRequests.filter((el) => {
            return el !== walletAddress;
        })
    }
}

module.exports = Mempool;