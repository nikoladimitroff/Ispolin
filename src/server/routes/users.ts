/// <reference path="../../common/models.ts" />

"use strict";
import restify = require("restify");
import Q = require("q");
import { Logger } from "../logger";
import { IRoute } from "./route";
import { DataAccessLayer } from "../data_access_layer";
import { SchemaModels } from "../schemas";

type IGrade = Models.IGrade;
type ICourseData = Models.ICourseData;

interface ISummarizedGrades {
    name: string;
    totalGrade: number;
}
type SummarizedGradesPromise = Q.Promise<ISummarizedGrades[]>;
export class Users implements IRoute {

    public handleRequest(req: restify.Request,
                         res: restify.Response,
                         next: restify.Next): void {
        let sendResults = (result: ISummarizedGrades[]): void => {
            res.send(200, result);
        };
        let courseName = req.params.shortCourseName;
        console.log(courseName);
        this.summarizeUsers(courseName).done(sendResults, (error) => {
            Logger.error("Error in /api/users: {0}", error);
        });
    }

    private sumResults(results: IGrade[]): number {
        return results.reduce((sum, current) => sum + current.grade, 0);
    }

    private groupUserGrades(data: ICourseData[]): ISummarizedGrades[] {
        let groupedData = data.map((courseData) => {
            return {
                name: courseData.user.name,
                totalGrade: this.sumResults(courseData.results)
            };
        });
        groupedData.sort((x, y) => x.totalGrade - y.totalGrade);
        return groupedData;
    }

    private summarizeUsers(courseName: string): SummarizedGradesPromise {
        let queryGrades = Q(SchemaModels.CourseData
                                        .find({ course: courseName })
                                        .populate("user")
                                        .exec());
        let promise = queryGrades.then(this.groupUserGrades.bind(this),
                                       DataAccessLayer.onError);
        return promise as any as SummarizedGradesPromise;
    }
}
