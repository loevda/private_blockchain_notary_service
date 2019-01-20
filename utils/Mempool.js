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
        const self = this;
        const requestTimeStamp = new Date().getTime();
        if (this.timeoutRequests[walletAddress] === undefined) {
            this.timeoutRequests[walletAddress] = [requestTimeStamp,
                this._setTimeout(walletAddress, this.timeoutRequestsWindowTime,
                    this.timeoutRequests)];
        }
        return {
            "walletAddress": walletAddress,
            "requestTimeStamp": this.timeoutRequests[walletAddress][0],
            "message": `${walletAddress}:${this.timeoutRequests[walletAddress][0]}:starRegistry`,
            "validationWindow": Math.round(this._calculateValidationWindow(this.timeoutRequests[walletAddress][0], this.timeoutRequestsWindowTime)/1000)
        }
    }

    validateRequestByWallet(walletAddress, signature) {
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
            this.pool[walletAddress] = [respObj, this._setTimeout(walletAddress,
                this.timeoutValidWindowTime, this.pool)];
            this._removeValidationRequest(walletAddress, this.timeoutRequests);
            return respObj;
        }else{
            throw new MempoolError("Not authorized", 401);
        }

    }

    verifyAddressRequest(walletAddress) {
        return this.pool[walletAddress] !== undefined;
    }

    removeStarFromPool(walletAddress) {
        _removeValidationRequest(walletAddress, this.pool);
    }


    _calculateValidationWindow(requestTimeStamp, windowTime) {
        return (windowTime - (new Date().getTime() - requestTimeStamp));
    }

    _setTimeout(walletAddress, windowTime, dict) {
        const self = this;
        dict[walletAddress]=
            setTimeout(function(){ self._removeValidationRequest(walletAddress, dict) },
                windowTime );
    }

    _removeValidationRequest(walletAddress, dict) {
        dict = dict.filter((el) => {
            return el !== walletAddress;
        });
    }
}

module.exports = Mempool;