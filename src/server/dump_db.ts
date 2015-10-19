/// <reference path="../../typings/restify/restify.d.ts" />
/// <reference path="../../typings/bunyan/bunyan.d.ts" />
/// <reference path="../../typings/mongoose/mongoose.d.ts" />

/// <reference path="../common/definitions.ts" />

"use strict";
import bunyan = require("bunyan");
import mongoose = require("mongoose");
import Q = require("q");

import { Validator } from "./validator";
import DataAccessLayer from "./data_access_layer";
import { SchemaModels } from "./schemas";

type MongooseModel = mongoose.Model<any>;
type AnyPromise = Q.Promise<any>;

let dbReader = {
    course: function (): AnyPromise {
        return Q(SchemaModels.Course
                             .find({})
                             .exec());
    },
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
    let logger = bunyan.createLogger({ name: "Unnamed" });
    let dal = new DataAccessLayer("mongodb://localhost/system-data", logger);

    let dbToPrint: string[] = [];
    if (process.argv.length === 2) {
        dbToPrint = ["user", "course", "coursedata"];
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
