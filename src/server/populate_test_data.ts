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
    let databases = ["Course", "User", "CourseData"];
    let promises: AnyPromise[] = [];
    for (let i = 0; i < databases.length; i++) {
        let mongoPromise = DataAccessLayer.instance.promiseForMongo();
        let mappable = <IMappable<MongooseModel>>(<any>SchemaModels);
        let model = <MongooseModel>(mappable[databases[i]]);
        model.remove({}, mongoPromise.callback);
    }
    return Q.all(promises);
}

function populateCourses(): AnyPromise {
    let courses: SchemaModels.ICourseInfo[] = [
        new SchemaModels.Course({
            name: "Game Engine Architecture",
            shortName: "GEA",
            lecturesDir: "/lectures/GEA/",
            link: "course_index.html",
            description: "An gentle introduction to the topic of " +
                         "architecturing game engines."
        }),
        new SchemaModels.Course({
            name: "High Performance Computing",
            shortName: "HPC",
            link: "course_index.html",
            description: "How to make your computer fly",
            availableHomeworks: [{
                title: "Just spas",
                description: "Just spas is a comic by Sten Damyanov",
                programmingLanguage: "cpp"
            }, {
                title: "The golden apple",
                description: "The golden apple is an upcoming animation series",
                programmingLanguage: "cpp"
            },
            ]
        })
    ];
    return DataAccessLayer.instance.saveAll(courses);
}

function populateUsers(): AnyPromise {
    let users: SchemaModels.IUser[] = [
        new SchemaModels.User({
            name: "Nikola Dimitroff",
            passportHash: Validator.hashPassword("asd"),
            mail: "nikola@dimitroff.bg",
            fn: "12345"
        }),
        new SchemaModels.User({
            name: "Dimitar Trendafilov",
            passportHash: Validator.hashPassword("asd"),
            mail: "dimitar@coherent-labs.com",
            fn: "54321"
        })
    ];
    return DataAccessLayer.instance.saveAll(users);
}

function fillInCourseData(courseInfo: SchemaModels.ICourseInfo,
                          users: SchemaModels.IUser[]): AnyPromise {
    console.log("Filling inside", courseInfo, users);
    let courseData: SchemaModels.ICourseData[] = [
        new SchemaModels.CourseData({
            course: courseInfo._id,
            user: users[0]._id,
            results: [
                { source: "Test 1", grade: 0.1, runningTime: 1, max: 0.15 },
                { source: "Homework 1", grade: 0.2, runningTime: 1, max: 0.2 }
            ]
        }),
        new SchemaModels.CourseData({
            course: courseInfo._id,
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
    let coursePromise = SchemaModels.Course.find({}).exec();
    let fillAllData = (users: SchemaModels.IUser[],
                       courses: SchemaModels.ICourseInfo[]): AnyPromise => {
        let promises: AnyPromise[] = [];
        for (let courseInfo of courses) {
            promises.push(fillInCourseData(courseInfo, users));
        }
        return Q.all(promises);
    };
    // Q.d.ts does not allow for spreading promises of different types
    // We must cast the arguments to any
    return Q.spread([userPromise, coursePromise],
                    fillAllData as (x: any, y: any) => AnyPromise);
}

function populateData(): AnyPromise {
    return Q.all([
            populateCourses(),
            populateUsers()
        ]).then(() => populateCourseData());
}

function main(): any {
    let logger = bunyan.createLogger({ name: "Unnamed" });
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
