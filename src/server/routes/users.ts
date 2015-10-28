/// <reference path="../../common/models.ts" />

"use strict";
import restify = require("restify");
import Q = require("q");
import { IRoute } from "./route";
import DataAccessLayer from "../data_access_layer";
import { SchemaModels } from "../schemas";

type ICourseInfo = SchemaModels.ICourseInfo;
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
            console.log("SUCCESS", arguments);
            res.send(200, result);
        };
        console.log(req.params.courseId);
        this.summarizeUsers(req.params.courseId).done(sendResults, () => {
            console.log("ERROR", arguments);
        });
    }

    private sumResults(results: IGrade[]): number {
        return results.reduce((sum, current) => sum + current.grade, 0);
    }

    private groupUserGrades(data: ICourseData[]): ISummarizedGrades[] {
        console.log("2", data);
        let groupedData = data.map((courseData) => {
            return {
                name: courseData.user.name,
                totalGrade: this.sumResults(courseData.results)
            };
        });
        console.log("3", groupedData);
        groupedData.sort((x, y) => x.totalGrade - y.totalGrade);
        return groupedData;
    }

    private summarizeUsers(courseId: string): SummarizedGradesPromise {
        let queryGrades = Q(SchemaModels.CourseData
                                        .find({ course: courseId })
                                        .populate("user")
                                        .exec());
        console.log("1");
        let promise = queryGrades.then(this.groupUserGrades.bind(this),
                                       DataAccessLayer.instance.onError);
        return promise as any as SummarizedGradesPromise;
    }
}
