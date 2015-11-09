import crypto = require("crypto");

export module Validator {
    "use strict";

    export function validateFacultyNumber(fn: string): boolean {
        return fn && /\d+/.test(fn);
    }

    export function validateEmail(email: string): boolean {
        // Magical regex
        /* tslint:disable */
        let regex = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/;
        /* tslint:enable */
        return email && regex.test(email);
    }

    export var weakPasswordMessage = "" +
        "Your password must be at least 8 characters long";

    export function validatePasswordStrength(password: string): boolean {
        return password.length >= 8;
    }

    export function newSalt(): string {
        return crypto.randomBytes(256).toString("utf-8");
    }

    export function hashPassword(password: string, salt: string): string {
        let hasher = crypto.createHash("sha256");
        hasher.update(password, "utf-8");
        hasher.update(salt, "utf-8");
        let hash = hasher.digest("hex");
        return hash;
    }

    export function checkPassword(password: string,
                                  hash: string,
                                  salt: string): boolean {
        return hash === this.hashPassword(password, salt);
    }
}
