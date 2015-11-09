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
function clear(): AnyPromise {
    let databases = ["User", "CourseData"];
    let promises: AnyPromise[] = [];
    for (let i = 0; i < databases.length; i++) {
        let mongoPromise = DataAccessLayer.instance.promiseForMongo();
        let mappable = <IMappable<MongooseModel>>(<any>SchemaModels);
        let model = <MongooseModel>(mappable[databases[i]]);
        model.remove({}, mongoPromise.callback);
    }
    return Q.all(promises);
}

function populateUsers(): AnyPromise {
    let salt1 = Validator.newSalt();
    let salt2 = Validator.newSalt();
    let users: SchemaModels.IUser[] = [
        new SchemaModels.User({
            name: "Nikola Dimitroff",
            passportHash: Validator.hashPassword("asd", salt1),
            salt: salt1,
            mail: "nikola@dimitroff.bg",
            fn: "12345"
        }),
        new SchemaModels.User({
            name: "Dimitar Trendafilov",
            passportHash: Validator.hashPassword("asd", salt2),
            salt: salt2,
            mail: "dimitar@coherent-labs.com",
            fn: "54321"
        })
    ];
    return DataAccessLayer.instance.saveAll(users);
}

function fillInCourseData(courseName: string,
                          users: SchemaModels.IUser[]): AnyPromise {
    console.log("Filling inside", courseName, users);
    let courseData: SchemaModels.ICourseData[] = [
        new SchemaModels.CourseData({
            course: courseName,
            user: users[0]._id,
            results: [
                { source: "Test 1", grade: 0.1, runningTime: 1, max: 0.15 },
                { source: "Homework 1", grade: 0.2, runningTime: 1, max: 0.2 }
            ]
        }),
        new SchemaModels.CourseData({
            course: courseName,
            user: users[1]._id,
            results: [
                { source: "Bonus 1", grade: 0.02, runningTime: 1, max: 0.02 },
                { source: "Bonus 2", grade: 0.01, runningTime: 1, max: 0.02 },
                { source: "Project", grade: 0.28, runningTime: 1, max: 0.3 }
            ]
        })
    ];
    return DataAccessLayer.instance.saveAll(courseData);
}

function populateCourseData(): AnyPromise {
    let userPromise = SchemaModels.User.find({}).exec();
    let fillAllData = (users: SchemaModels.IUser[]): AnyPromise => {
        let courses = ["hpc", "gea"];
        let promises: AnyPromise[] = [];
        for (let courseInfo of courses) {
            promises.push(fillInCourseData(courseInfo, users));
        }
        return Q.all(promises);
    };
    return userPromise.then(fillAllData) as any as AnyPromise;
}

function populateData(): AnyPromise {
    return populateUsers()
           .then(() => populateCourseData());
}

function main(): any {
    let logger = bunyan.createLogger({ name: "Ispolin" });
    let dal = new DataAccessLayer("mongodb://localhost/system-data", logger);

    let postClean = () => {
        logger.info("Repopulating with default data...");
        return populateData();
    };
    let postPopulate = () => {
        logger.info("Done!");
    };
    let onError = (error: string) => {
        logger.error("FAILED!" + error);
    };
    logger.info("Cleaning up db...");
    clear()
    .then(postClean, onError)
    .then(postPopulate, onError).done(() => process.exit());
}

if (require.main === module) {
    main();
}
