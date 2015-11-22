/// <reference path="../../typings/restify/restify.d.ts" />
/// <reference path="../../typings/bunyan/bunyan.d.ts" />
/// <reference path="../../typings/mongoose/mongoose.d.ts" />

"use strict";
import bunyan = require("bunyan");
import mongoose = require("mongoose");
import Q = require("q");

import { Validator } from "./validator";
import { DataAccessLayer } from "./data_access_layer";
import { SchemaModels } from "./schemas";

type MongooseModel = mongoose.Model<any>;
type AnyPromise = Q.Promise<any>;

interface IFunctionContainer {
    [key: string]: () => AnyPromise;
}

let dbReader: IFunctionContainer = {
    user: function (): AnyPromise {
        return Q(SchemaModels.User
                             .find({})
                             .exec());
    },
    coursedata: function (): AnyPromise {
        return Q(SchemaModels.CourseData
                             .find({})
                             .exec());
    }
};

function main(): any {
    let dbToPrint: string[] = [];
    if (process.argv.length === 2) {
        dbToPrint = ["user", "coursedata"];
    } else {
        // The first 2 args are node.js and the executing script, ignore them
        dbToPrint = process.argv.filter((_, i) => i >= 2)
                                .map(db => db.toLowerCase());
    }
    dbToPrint.sort();
    let promises: Q.Promise<any>[] = dbToPrint.map(db => dbReader[db]());
    Q.all(promises).then((results) => {
        for (let i = 0; i < results.length; i++) {
            console.log("------------- ", dbToPrint[i], " -------------");
            for (let record of results[i]) {
                console.log(JSON.stringify(record));
            }
            console.log("-------------");
        }
    })
    .done(() => process.exit());
}

if (require.main === module) {
    main();
}
