/// <reference path="../../common/models.ts" />

import restify = require("restify");
import { IRoute } from "./route";
import DataAccessLayer from "../data_access_layer";
import { SchemaModels } from "../schemas";

type ICourseInfo = SchemaModels.ICourseInfo;
type IGrade = Models.IGrade;
type ICourseData = Models.ICourseData;

export module Routes {
    "use strict";
    interface ISummarizedGrades {
        name: string;
        totalGrade: number;
    }
    type SummarizedGradesPromise = Q.Promise<ISummarizedGrades[]>;
    export class Users implements IRoute {

        public handleRequest(req: restify.Request,
                             res: restify.Response,
                             next: restify.Next): void {
            console.log("here we are!");
            let queryId = SchemaModels.Course
                                      .findOne({shortName: req.params.course})
                                      .exec();
            let sendResults = (result: ISummarizedGrades[]): void => {
                res.send(200, result);
            };
            queryId.then(this.summarizeUsers.bind(this))
                   .then(sendResults);
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

        private summarizeUsers(course: ICourseInfo): SummarizedGradesPromise {
            let queryGrades = SchemaModels.CourseData
                                          .find({ course: course._id })
                                          .populate("user")
                                          .exec();
            let promise = queryGrades.then(this.groupUserGrades.bind(this),
                                           DataAccessLayer.instance.onError);
            return promise as any as SummarizedGradesPromise;
        }
    }
}

let f: () => number[];
let p: Q.Promise<number[]>;
let g = (): Q.Promise<number[]> => {
    return p.then(f);
};
