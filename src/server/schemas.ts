/// <reference path="../common/models.ts" />

import mongoose = require("mongoose");

module Schemas {
    "use strict";

    export var course = new mongoose.Schema({
        name: { type: String, index: true },
        shortName: { type: String, index: true },
        lecturesDir: String,
        link: String,
        description: String
    });
    export var user = new mongoose.Schema({
        name: String,
        mail: { type: String, index: true },
        fn: { type: String, index: true }
    });

    user.virtual("totalGrade").get(function (): number {
        return 1;
    });
    user.set("toJSON", {
        virtuals: true
    });

    export var courseData = new mongoose.Schema({
        courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        data: {
            class: String,
            results: [{
                source: String,
                grade: String,
                max: String
            }]
        }
    });
}

export module SchemaModels {
    "use strict";

    type Document = mongoose.Document;
    export interface ICourseInfo extends Models.ICourseInfo, Document {
    }
    export interface IUser extends Models.IUser, Document {
    }
    export interface ICourseData extends Models.ICourseData, Document {
    }


    /* tslint:disable:variable-name */
    export var Course = mongoose.model<ICourseInfo>("Course", Schemas.course);
    export var User = mongoose.model<IUser>("User", Schemas.user);
    export var CourseData = mongoose.model<ICourseData>("CourseData",
                                                        Schemas.courseData);
    /* tslint:enable:variable-name */
}
