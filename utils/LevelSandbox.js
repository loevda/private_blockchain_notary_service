/* ===== Persist data with LevelDB ==================
|  Learn more: level: https://github.com/Level/level |
/===================================================*/

const level = require('level');
const chainDB = '../chaindata';

class LevelSandbox {

    constructor() {
        this.db = level(chainDB);
    }

    // Get data from levelDB with key (Promise)
    async getLevelDBData(key){
        let self = this;
        let promise = new Promise(function(resolve, reject) {
            // Add your code here, remember un Promises you need to resolve() or reject()
            self.db.get(key, function(err, value) {
                if (err) {
                    reject(err);
                }else{
                    resolve(JSON.parse(value));
                }
            })
        });
        return await promise;
    }

    // Add data to levelDB with key and value (Promise)
    async addLevelDBData(key, value) {
        let self = this;
        let promise = new Promise(function(resolve, reject) {
            // Add your code here, remember un Promises you need to resolve() or reject()
            self.db.put(key, value, function(err) {
                if (err)
                    reject(err);
                resolve(value);
            });
        });
        return await promise;
    }

    // Method that return the height
    async getBlocksCount() {
        let self = this;
        let promise = new Promise(function(resolve, reject){
            // Add your code here, remember un Promises you need to resolve() or reject()
            let i = 0;
            self.db.createReadStream().on('data', function(data) {
                i++;
            }).on('error', function(err) {
                reject(err);
            }).on('end', function() {
                resolve(i);
            });
        });
        return await promise;
    }

    // Get block by hash
    async getBlockByHash(hash) {
        let self = this;
        let block = null;
        let promise = new Promise(function(resolve, reject){
            self.db.createReadStream()
                .on('data', function (data) {
                    if(data.hash === hash){
                        block = data;
                    }
                })
                .on('error', function (err) {
                    reject(err)
                })
                .on('close', function () {
                    resolve(block);
                });
        });
        return await promise;
    }
        

}

module.exports = LevelSandbox;