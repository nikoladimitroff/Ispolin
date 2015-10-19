/// <reference path="../../common/models.ts" />

"use strict";
import restify = require("restify");
import Q = require("q");
import { IRoute } from "./route";
import DataAccessLayer from "../data_access_layer";
import { SchemaModels } from "../schemas";

type IUser = SchemaModels.IUser;
type ICourseInfo = SchemaModels.ICourseInfo;
type IGrade = Models.IGrade;

export class Results implements IRoute {

    public handleRequest(req: restify.Request,
                         res: restify.Response,
                         next: restify.Next): void {
        let queryId = Q(SchemaModels.Course
                                    .findOne({shortName: req.params.course})
                                    .exec());
        let sendResults = (queryData: Models.ICourseData): void => {
            res.send(200, queryData.results);
        };
        let user: IUser = (req as any).user;
        queryId.then(this.getResults.bind(this, user))
               .done(sendResults);
    }

    private getResults(user: IUser, course: ICourseInfo): any {
        let query = {
            course: course._id,
            user: user._id
        };
        console.log(user, course);
        let queryGrades = SchemaModels.CourseData
                                      .findOne(query)
                                      .select("results")
                                      .exec();
        return queryGrades;
    }
}
