/// <reference path="../../typings/mongoose/mongoose.d.ts" />

module Models {
    "use strict";

    export interface IResource {
        name: string;
        link: string;
        description: string;
    }

    export interface ICourseInfo extends IResource {
    }

    export interface IUser {
        name: string;
        mail: string;
        fn: string;
        totalGrade: number;
    }

    export interface IGrade {
        source: string;
        grade: number;
        max: number;
    }

    export interface IUserData {
        class: string;
        results: IGrade[];
    }

    export interface ICourseData {
        courseId: any;
        studentId: any;
        data: IUserData;
    }
}
