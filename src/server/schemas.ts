import mongoose = require("mongoose");

/// <reference path="../common/models.ts" />

module Schemas {
    "use strict";

    export var user = new mongoose.Schema({
        name: String,
        passportHash: String,
        salt: String,
        mail: { type: String, index: true },
        fn: { type: String, index: true }
    });

    export var courseData = new mongoose.Schema({
        course: String,
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        results: [{
            source: String,
            grade: Number,
            runningTime: Number,
            max: Number
        }]
    });
}

export module SchemaModels {
    "use strict";

    type Document = mongoose.Document;
    export interface IUser extends Models.IUser, Document {
    }
    export interface ICourseData extends Models.ICourseData, Document {
    }


    /* tslint:disable:variable-name */
    export var User = mongoose.model<IUser>("User", Schemas.user);
    export var CourseData = mongoose.model<ICourseData>("CourseData",
                                                        Schemas.courseData);
    /* tslint:enable:variable-name */
}
