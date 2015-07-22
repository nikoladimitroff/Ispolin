/// <reference path="../../typings/restify/restify.d.ts" />
/// <reference path="../../typings/bunyan/bunyan.d.ts" />

"use strict";
import bunyan = require("bunyan");

import DataAccessLayer from "./data_access_layer";
import { SchemaModels } from "./schemas";

function clear(dal: DataAccessLayer): void {
    SchemaModels.Course.remove({}, dal.onError);
    SchemaModels.User.remove({}, dal.onError);
    SchemaModels.CourseData.remove({}, dal.onError);
}

function populateCourses(dal: DataAccessLayer): void {
    let courses: SchemaModels.ICourseInfo[] = [
        new SchemaModels.Course({
            name: "Course Test",
            link: "course_index.html",
            description: "Testing testy for testing purposy."
        }),
        new SchemaModels.Course({
            name: "Because CL!",
            link: "http://coherent-labs.com",
            description: "Coherent labs' Being Awesome 101"
        })
    ];
    for (let course of courses) {
        course.save(dal.onError);
    }
}



function populateUsers(dal: DataAccessLayer): void {
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
    for (let user of users) {
        user.save(dal.onError);
    }
}

function fillInCourseData(dal: DataAccessLayer,
                          courseInfo: SchemaModels.ICourseInfo,
                          users: SchemaModels.IUser[]): void {
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
    for (let data of courseData) {
        data.save(dal.onError);
    }
}

function populateCourseData(dal: DataAccessLayer): void {
    let users: SchemaModels.IUser[];
    let courseInfo: SchemaModels.ICourseInfo;
    let userPromise = SchemaModels.User.find({}).exec();
    let coursePromise = SchemaModels.Course.findOne({name: "Course Test"})
                                           .exec()  ;
    userPromise.then((data: SchemaModels.IUser[]) => {
        users = data;
    });
    coursePromise.then((data: SchemaModels.ICourseInfo) => {
        courseInfo = data;
    });
    userPromise.then(() => {
        coursePromise.then(fillInCourseData.bind(undefined, courseInfo, users));
    });
}

function populateData(dal: DataAccessLayer): void {
    populateCourses(dal);
    populateUsers(dal);
    populateCourseData(dal);
}

function main(): void {
    let logger = bunyan.createLogger({ name: "Unnamed" });
    let dal = new DataAccessLayer("mongodb://localhost/system-data", logger);

    logger.info("Cleaning up db...");
    clear(dal);
    logger.info("Repopulating with default data...");
    populateData(dal);
    logger.info("Done!");
}

if (require.main === module) {
    main();
}
