module Models {
    "use strict";

    // REMEMBER TO CHANGE SCHEMAS.TS IF YOU MAKE CHANGES TO THE DB MODELS!
    export interface IResource {
        name: string;
        link: string;
        description: string;
    }

    // Enums in TS are number-based but this should be string-based
    export class ProgrammingLanguage {
        public static cpp: ProgrammingLanguage = new ProgrammingLanguage("CPP");

        private value: string;
        constructor(value: string) { this.value = value; }
    }

    export interface IHomework {
        title: string;
        description: string;
        programmingLanguage: ProgrammingLanguage;
    }

    export interface ICourseInfo extends IResource {
        shortName: string;
        lecturesDir: string;
        availableHomeworks: IHomework[];
    }

    export interface IUser {
        name: string;
        passportHash: string;
        mail: string;
        fn: string;
        totalGrade: number;
    }

    export interface IGrade {
        source: string;
        grade: number;
        runningTime: number;
        max: number;
    }

    export interface ICourseData {
        course: any;
        user: any;
        results: IGrade[];
    }
}
