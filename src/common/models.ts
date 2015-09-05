module Models {
    "use strict";

    // REMEMBER TO CHANGE THE SCHEMAS.TS IF YOU MAKE CHANGES TO THE MODELS!
    export interface IResource {
        name: string;
        link: string;
        description: string;
    }

    export interface ICourseInfo extends IResource {
        shortName: string;
        lecturesDir: string;
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

    export interface ICourseData {
        course: any;
        user: any;
        results: IGrade[];
    }
}
