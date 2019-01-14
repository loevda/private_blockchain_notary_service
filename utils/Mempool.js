/**
 * Created by david2099 on 14/01/19.
 */


class Mempool {

    constructor() {
        this.pool = [];
        this.timeoutRequests = [];
    }

    addRequestValidation(walletAddress) {
        const requestTimeStamp = new Date().getTime()
        return {
            "walletAddress": walletAddress,
            "requestTimeStamp": requestTimeStamp,
            "message": `${walletAddress}:${requestTimeStamp}:starRegistry`,
            "validationWindow": 300
        }
    }

    setTimeOut() {

    }

    requestObject() {

    }

    validateRequestByWallet() {

    }

    verifyAddressRequest() {

    }

    _removeRequestValidation() {

    }

    _setTimeout(walletAddress) {
        self.timeoutRequests[walletAddress]=setTimeout(function(){ self._removeValidationRequest(walletAddress) }, TimeoutRequestsWindowTime );
    }

    _verifyTimeLeft() {

    }

    _removeValidationRequest(walletAddress) {
        this.timeoutRequests = this.timeoutRequests.filter((obj) => {
            return obj.walletAddress !== walletAddress;
        });
    }
}

module.exports = Mempool;