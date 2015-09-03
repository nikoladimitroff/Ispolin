/// <reference path="../../typings/restify/restify.d.ts" />
/// <reference path="../../typings/bunyan/bunyan.d.ts" />
/// <reference path="../../typings/mongoose/mongoose.d.ts" />

/// <reference path="../common/definitions.ts" />

"use strict";
import bunyan = require("bunyan");
import mongoose = require("mongoose");
import Q = require("q");

import DataAccessLayer from "./data_access_layer";
import { SchemaModels } from "./schemas";

type MongooseModel = mongoose.Model<any>;
function clear(): Q.Promise<any> {
    let databases = ["Course", "User", "CourseData"];
    let promises: Q.Promise<any>[] = [];
    for (let i = 0; i < databases.length; i++) {
        let mongoPromise = DataAccessLayer.instance.promiseForMongo();
        let mappable = <IMappable<MongooseModel>>(<any>SchemaModels);
        let model = <MongooseModel>(mappable[databases[i]]);
        model.remove({}, mongoPromise.callback);
    }
    return Q.all(promises);
}

function saveAll(data: mongoose.Document[]): Q.Promise<any> {
    let promises: Q.Promise<any>[] = [];
    for (let obj of data) {
        let mongoPromise = DataAccessLayer.instance.promiseForMongo();
        obj.save(mongoPromise.callback);
        promises.push(mongoPromise.promise);
    }
    return Q.all(promises);
}

function populateCourses(): Q.Promise<any> {
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
            name: "Coherent Labs rocks!",
            shortName: "CLR",
            link: "http://coherent-labs.com",
            description: "Coherent labs' Being Awesome 101"
        })
    ];
    return saveAll(courses);
}

function populateUsers(): Q.Promise<any> {
    let users: SchemaModels.IUser[] = [
        new SchemaModels.User({
            name: "Nikola Dimitroff",
            mail: "nikola@dimitroff.bg",
            fn: "12345"
        }),
        new SchemaModels.User({
            name: "Dimitar Trendafilov",
            mail: "dimitar@coherent-labs.com",
            fn: "54321"
        })
    ];
    return saveAll(users);
}

function fillInCourseData(courseInfo: SchemaModels.ICourseInfo,
                          users: SchemaModels.IUser[]): Q.Promise<any> {
    let courseData: SchemaModels.ICourseData[] = [
        new SchemaModels.CourseData({
            courseId: courseInfo._id,
            userId: users[0]._id,
            results: [
                { source: "Test 1", grade: 0.1, max: 0.15 },
                { source: "Homework 1", grade: 0.2, max: 0.2 }
            ]
        }),
        new SchemaModels.CourseData({
            courseId: courseInfo._id,
            userId: users[1]._id,
            results: [
                { source: "Bonus 1", grade: 0.02, max: 0.02 },
                { source: "Bonus 2", grade: 0.01, max: 0.02 },
                { source: "Course project", grade: 0.28, max: 0.3 }
            ]
        })
    ];
    return saveAll(courseData);
}

function populateCourseData(): Q.Promise<any> {
    let users: SchemaModels.IUser[];
    let courseInfo: SchemaModels.ICourseInfo;
    let userPromise = SchemaModels.User.find({}).exec();
    let coursePromise = SchemaModels.Course.findOne({short: "GAE1"})
                                           .exec()  ;
    userPromise.then((data: SchemaModels.IUser[]) => {
        users = data;
    });
    coursePromise.then((data: SchemaModels.ICourseInfo) => {
        courseInfo = data;
    });
    let deferred = Q.defer<any>();
    userPromise.then(() => {
        coursePromise.then(() => {
            fillInCourseData(courseInfo, users);
            deferred.resolve(undefined);
        });
    });
    return deferred.promise;
}

function populateData(): Q.Promise<any> {
    return Q.all([
        populateCourses(),
        populateUsers(),
        populateCourseData(),
    ]);
}

function main(): void {
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
