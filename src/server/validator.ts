import crypto = require("crypto");

export module Validator {
    "use strict";
    export function hashPassword(password: string): string {
        let hasher = crypto.createHash("sha256");
        hasher.update(password);
        let hash = hasher.digest("hex");
        return hash;
    }

    export function checkPassword(password: string, hash: string): boolean {
        return hash === this.hashPassword(password);
    }
}
