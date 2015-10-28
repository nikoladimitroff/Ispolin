/// <reference path="../../common/models.ts" />

"use strict";
import restify = require("restify");
import Q = require("q");
import { IRoute } from "./route";
import DataAccessLayer from "../data_access_layer";
import { SchemaModels } from "../schemas";
import { testCppFile } from "../homework_testers/cpp";

type IUser = SchemaModels.IUser;
type ICourseInfo = SchemaModels.ICourseInfo;
type IGrade = Models.IGrade;

export class Homework implements IRoute {

    public handleRequest(req: restify.Request,
                         res: restify.Response,
                         next: restify.Next): void {
        let courseId = req.params.courseId;
        let homeworkName = req.body.name;
        let homeworkSolution = req.body.solution;
        let queryCourseId = Q(SchemaModels.Course
                                          .findOne({_id: courseId})
                                          .exec());
        // For now always run the cpp file tester
        let result = testCppFile(homeworkName, homeworkSolution);

        let sendResults = () => res.send(200);
        let sendError = () => res.send(500, "An unknown error ocurred");
        let user: IUser = (req as any).user;
        this.addResult(user, courseId, result).done(sendResults, sendError);
    }

    private addResult(user: IUser, courseId: string, result: IGrade): any {
        let query = {
            course: courseId,
            user: user._id
        };
        let queryGrades = Q(SchemaModels.CourseData
                                        .findOne(query)
                                        .exec());
        return queryGrades.then(courseData => {
            if (!courseData) {
                courseData = new SchemaModels.CourseData({
                course: courseId,
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
