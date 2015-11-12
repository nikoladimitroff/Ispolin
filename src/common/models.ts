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
        // Must always be stored as UTC
        endDate: Date;
        programmingLanguage: ProgrammingLanguage;
        checker: string;
    }

    export interface ICheckerDescription {
        name: string;
        path: string;
    }

    export interface ICourseInfo extends IResource {
        shortName: string;
        customcheckers?: ICheckerDescription[];
    }

    type TranslationSubmap = {
        [entry: string]: {
            text: string,
            icon: string,
            requiresLogin: boolean
        }
    };
    export interface ITranslationMap {
        mainMenu: TranslationSubmap;
    }

    // Used to give extra details about each course
    export interface IDetailedCourseInfo extends ICourseInfo {
        translations: ITranslationMap;
        resources: IResource[];
        news: string[];
        lectures: string[];
        availableHomeworks: IHomework[];
    }

    export interface IUser {
        name: string;
        passportHash: string;
        salt: string;
        mail: string;
        fn: string;
    }

    export interface IGrade {
        source: string;
        grade: number;
        runningTime: number;
        max: number;
    }

    export interface ICourseData {
        course: String;
        user: any;
        results: IGrade[];
    }
}
