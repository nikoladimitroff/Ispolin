/// <reference path="../../typings/bunyan/bunyan.d.ts" />
/// <reference path="../../typings/mongoose/mongoose.d.ts" />
/// <reference path="../../typings/q/Q.d.ts" />

"use strict";
import mongoose = require("mongoose");
import Q = require("q");

import { Logger } from "./logger";

interface IMongoPromise {
    promise: Q.Promise<any>;
    callback: (err: any) => void;
}

export class DataAccessLayerImpl {

    // A function that is already bound to this
    public onError: (err: string) => void;

    private db: mongoose.Connection;

    constructor(url: string) {
        this.onError = (error: string) => this.onErrorCallback(error);

        mongoose.connect(url);
        this.db = mongoose.connection;
        this.db.on("error", console.error.bind(console, "connection error:"));
        this.db.once("open", () => {
            Logger.info("DB Connection opened...");
        });
    }

    public onErrorCallback(message: string): void {
        if (message) {
            Logger.error("A DB error occurred! %s", message);
        }
    };

    public saveAll<T>(data: mongoose.Document[]): Q.Promise<T[]> {
        let promises: Q.Promise<T>[] = [];
        for (let obj of data) {
            let mongoPromise = this.promiseForMongo();
            obj.save(mongoPromise.callback);
            promises.push(mongoPromise.promise);
        }
        return Q.all(promises);
    }

    public promiseForMongo(): IMongoPromise {
        let deferred = Q.defer<boolean>();
        return {
            promise: deferred.promise,
            callback: (error: any): void => {
                this.onErrorCallback(error);
                if (error) {
                    deferred.reject(error);
                } else {
                    deferred.resolve(true);
                }
            }
        };
    }

}

/* tslint:disable */
export var DataAccessLayer = new DataAccessLayerImpl("mongodb://localhost/system-data");
/* tslint:enable */
