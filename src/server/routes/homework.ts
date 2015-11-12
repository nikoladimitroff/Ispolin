/// <reference path="../../common/models.ts" />

"use strict";
import restify = require("restify");
import Q = require("q");
import { IRoute } from "./route";
import DataAccessLayer from "../data_access_layer";
import { SchemaModels } from "../schemas";
import { CourseParser } from "./course_parser";

type IUser = SchemaModels.IUser;
type IGrade = Models.IGrade;

export class Homework implements IRoute {

    public handleRequest(req: restify.Request,
                         res: restify.Response,
                         next: restify.Next): void {
        let courseName = req.params.shortCourseName;
        let homeworkName = req.body.name;
        let homeworkSolution = req.body.solution;
        // Find the checker for this homework
        let course = CourseParser.instance.getDetailedInfo(courseName);
        let homework = null;
        for (let availableHomework of course.availableHomeworks) {
            if (availableHomework.title === homeworkName) {
                homework = availableHomework;
            }
        }
        let now = Date.now();
        if (!homework || homework.endDate.getTime() >= now) {
            res.send(400, "No such homework is currently available.");
            return;
        }
        let checker = CourseParser.instance.findChecker(homework.checker);
        let result = checker(homeworkName, homeworkSolution);

        let sendResults = () => res.send(200);
        let sendError = () => res.send(500, "An unknown error ocurred");
        let user: IUser = (req as any).user;
        this.addResult(user, courseName, result).done(sendResults, sendError);
    }

    private addResult(user: IUser, courseName: string, result: IGrade): any {
        let query = {
            course: courseName,
            user: user._id
        };
        let queryGrades = Q(SchemaModels.CourseData
                                        .findOne(query)
                                        .exec());
        return queryGrades.then(courseData => {
            if (!courseData) {
                courseData = new SchemaModels.CourseData({
                course: courseName,
                user: user._id,
                results: []
                });
            }
            let alreadyDoneHomework = false;
            for (let i = 0; i < courseData.results.length; i++) {
                if (courseData.results[i].source === result.source) {
                    courseData.results[i].grade = result.grade;
                    courseData.results[i].runningTime = result.runningTime;
                    courseData.results[i].max = result.max;
                    alreadyDoneHomework = true;
                    break;
                }
            }
            if (!alreadyDoneHomework) {
                courseData.results.push(result);
            }
            return DataAccessLayer.instance.saveAll([courseData]);
    });
    }
}
