/**
 * Created by ikonovalov on 29/01/17.
 */
"use strict";

const libcrypto = require('./libcrypto');

class MemKeys {

    constructor(dataDir) {
        this.dataDir = dataDir;
        this.accountToKeys = new Map();
    }

    /**
     * Unlock and cache key pair.
     * @param account
     * @param password
     * @returns {KeyPair}
     */
    unlockKeys(account, password) {
        if (this.isAccountLocked(account)) {
            let keyPair = libcrypto.keyPair(this.dataDir, account, password);
            this.storeKeys(account, keyPair);
            return keyPair;
        } else {
            return this.accountToKeys.get(account);
        }
    }

    storeKeys(account, keyPair) {
        this.accountToKeys.set(account, keyPair);
    }

    forgetKeys(account) {
        this.accountToKeys.delete(account);
    }

    /**
     * Check is account unlocked already.
     * @param account
     * @returns {boolean}
     */
    isAccountLocked(account) {
        return !this.accountToKeys.has(account);
    }
}

class TimedOutMemKeys extends MemKeys {

    constructor(dataDir, timeout) {
        super(dataDir);
        this.defaultTimeout = timeout || 60000;

    }

    storeKeys(account, keyPair, timeout) {
        super.storeKeys(account, keyPair);
        let expireTime = !timeout ? this.defaultTimeout : timeout;
        setTimeout(account => this.forgetKeys(account), expireTime, account).unref();
    }
}

module.exports = {
    simple: MemKeys,
    withTimeout: TimedOutMemKeys
};