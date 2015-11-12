// <reference path="../../common/models.ts" />
// <reference path="../../common/utils.ts" />

"use strict";
import fs = require("fs");
import fsExtra = require("fs-extra");
import path = require("path");

import bunyan = require("bunyan");
import markdown = require("markdown");
import restify = require("restify");
import Q = require("q");

// Import checkers
import { testCppFile } from "../homework_checkers/cpp";

type IHomework = Models.IHomework;
type IDetailedInfo = Models.IDetailedCourseInfo;
type IGrade = Models.IGrade;

type CheckerFunc = (homeworkName: string, solution: string) => IGrade;
export interface IMappable<T> {
    [name: string]: T;
}
let promisedReadfile = Q.denodeify(fs.readFile);
let promisedReaddir = Q.denodeify(fs.readdir);


function strEndsWith(str: string, suffix: string): boolean {
    return str.indexOf(suffix, str.length - suffix.length) !== -1;
};

export class CourseParser {
    public static instance: CourseParser;

    private courseBaseDir: string;
    private courseConfigFile: string;
    private allCourses: Models.ICourseInfo[];
    private detailedCourseMap: IMappable<IDetailedInfo>;
    private checkers: IMappable<CheckerFunc>;

    private presentationFilesRoot: string;

    public static init(): void {
        /* tslint:disable */
        new CourseParser();
        /* tslint:enable */
    }

    constructor() {
        CourseParser.instance = this;
        this.courseBaseDir = path.join(__dirname, "../../client/courses");
        const relativePresentationRoot = "../../client/3rdparty/reveal.js";
        this.presentationFilesRoot = path.join(__dirname,
                                               relativePresentationRoot);
        this.courseConfigFile = "ispolin.json";
        this.detailedCourseMap = {};
        this.allCourses = [];
        this.checkers = {};

        this.initialize();
    }

    public getAllCourses(): Models.ICourseInfo[] {
        return this.allCourses;
    }
    public getDetailedInfo(course: string): IDetailedInfo {
        return this.detailedCourseMap[course];
    }
    public findChecker(checkerName: string): CheckerFunc {
        return this.checkers[checkerName];
    }

    private initialize(): void {
        this.loadDefaultCheckers();
        // Find all directories that contain ispolin.json
        // and parse the configuration file
        fs.readdir(this.courseBaseDir, (error, courses: string[]) => {
            if (error) {
                throw new Error("Could not read dir: " + this.courseBaseDir);
            }
            for (let course of courses) {
                this.prepareCourse(course);
            }
        });
    }

    private prepareCourse(courseName: string): void {
        let courseDir = path.join(this.courseBaseDir, courseName);

        let configPath = path.join(courseDir, this.courseConfigFile);
        let getConfig = promisedReadfile(configPath, "utf-8")
                        .then(JSON.parse.bind(JSON));
        getConfig.done(this.loadCustomCheckers.bind(this, courseName));

        let translationsPath = path.join(courseDir, "translations.json");
        let getTranslations = promisedReadfile(translationsPath, "utf-8")
                              .then(JSON.parse.bind(JSON));

        let resourcesPath = path.join(courseDir, "resources.json");
        let getResources = promisedReadfile(resourcesPath, "utf-8")
                           .then(JSON.parse.bind(JSON));

        let newsPath = path.join(courseDir, "news.md");
        let getNews = promisedReadfile(newsPath, "utf-8")
                      .then(this.parseNews.bind(this));

        let lecturesPath = path.join(courseDir, "lectures");
        // Only accept .md files as lectures
        let filter = files => files.filter(f => strEndsWith(f, ".md"));
        let getLectures = promisedReaddir(lecturesPath)
                          .then(filter);

        let homeworksPath = path.join(courseDir, "homeworks");
        let parseHomeworks = this.parseAllHomeworks.bind(this, homeworksPath);
        let getHomeworks = promisedReaddir(homeworksPath)
                           .then(parseHomeworks);

        let dataPromises = [
            Q(courseName), getConfig, getResources, getTranslations,
            getNews, getLectures, getHomeworks
        ];
        Q.spread(dataPromises, this.createDetailedInfo.bind(this))
        .done((detailed: IDetailedInfo) => {
            this.detailedCourseMap[courseName] = detailed;
            let simpleInfo = {
                name: detailed.name,
                link: detailed.link,
                description: detailed.description,
                shortName: detailed.shortName
            };
            this.allCourses.push(simpleInfo);
        });
        this.copyPresentationFiles(courseName);
    }

    private copyPresentationFiles(courseName: string): void {
        // In order meet the requirement that courses can safely assume
        // that their lectures can use paths relative to their projects,
        // Make hardlinks to the presentation files
        // (a symlink would be better, but Windows requires admin rights)
        let lecturesDir = path.join(this.courseBaseDir,
                                    courseName,
                                    "lectures");
        promisedReaddir(this.presentationFilesRoot).done(files => {
            for (let f of files) {
                let src = path.join(this.presentationFilesRoot, f);
                let dest = path.join(lecturesDir, f);
                fsExtra.copySync(src, dest);
            }
        });
    }

    private loadCustomCheckers(courseName: string,
                               courseConfig: Models.ICourseInfo): void {
        // Reflection magic
        if (!courseConfig.customcheckers) {
            return;
        }
        for (let checker of courseConfig.customcheckers) {
            let checkerPath = checker.path;
            if (!path.isAbsolute(checkerPath)) {
                checkerPath = path.join(this.courseBaseDir,
                                        courseName,
                                        checker.path);
            }
            let checkerFunc = require(checkerPath);
            if (!checkerFunc || typeof checkerFunc !== "function") {
                throw new Error("Checker not found - " + checker.name +
                                " in file '" + checkerPath + "'");
            }
            this.checkers[checker.name] = checkerFunc;
        }
    }

    private loadDefaultCheckers(): void {
        /* tslint:disable */
        this.checkers["cpp"] = testCppFile;
        /* tslint:enable */
    }

    private parseNews(news: string): string[] {
        const newsSeparator = /^(\r\n|\n)--- NEXT NEWS ---(\r\n|\n)/gm;
        return news.split(newsSeparator)
               .map(n => markdown.markdown.toHTML(n.trim()))
               .filter(n => n.length > 0);
    }

    private parseAllHomeworks(basedir: string,
                              files: string[]): Q.Promise<IHomework[]> {
        let promises: Q.Promise<IHomework>[] = [];
        let jsonParser = (rawJSON: string) => JSON.parse(rawJSON) as IHomework;
        for (let file of files) {
            // Only parse .meta.json files
            if (file.indexOf(".meta.json") === -1) {
                continue;
            }
            let metaFilepath = path.join(basedir, file);
            let filepath = path.join(basedir, this.getMarkdownFromMeta(file));
            let readMeta = promisedReadfile(metaFilepath, "utf-8")
                           .then(jsonParser);
            let readFile = promisedReadfile(filepath, "utf-8");
            let readHomework = Q.spread([readMeta, readFile],
                                        (meta: IHomework, description) => {
                if (!meta.checker || !this.findChecker(meta.checker)) {
                    throw new Error("Could not find checker " + meta.checker +
                                    " for homework " + meta.title);
                }
                meta.endDate = new Date(meta.endDate as any);
                if (isNaN(meta.endDate.getTime())) {
                    let error = "Unspecified or invalid endDate for homework" +
                                meta.title;
                    throw new Error(error);
                }
                meta.description = markdown.markdown.toHTML(description);
                return meta;
            });
            promises.push(readHomework);
        }
        return Q.all(promises);
    }

    private getMarkdownFromMeta(metaFilename: string): string {
        return metaFilename.replace(".meta.json", ".md");
    }

    private createDetailedInfo(shortName: string,
                               info: Models.ICourseInfo,
                               resources: Models.IResource[],
                               translations: Models.ITranslationMap,
                               news: string[],
                               lectures: string[],
                               homeworks: IHomework[]): IDetailedInfo {
        let detailed: IDetailedInfo = info as IDetailedInfo;
        detailed.shortName = shortName;
        detailed.link = "course_index.html";
        detailed.resources = resources;
        detailed.translations = translations;
        detailed.news = news;
        detailed.lectures = lectures;
        detailed.availableHomeworks = homeworks;
        return detailed;
    }
}
