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
        console.log("here we are!");
        let queryId = Q(SchemaModels.Course
                                    .findOne({shortName: req.params.course})
                                    .exec());
        let sendResults = (result: IGrade[]): void => {
            console.log("rolling?");
            res.send(200, result);
        };
        let user: IUser = (req as any).user;
        console.log("Queryy?", req.params.course);
        queryId.then(this.getResults.bind(this, user))
               .done(sendResults);
    }

    private getResults(user: IUser, course: ICourseInfo): any {

        console.log("Querying stuff", user, course);
        let query = {
            course: course._id,
            user: user._id
        };
        console.log("_qry", query);
        let queryGrades = Q(SchemaModels.CourseData
                                        .findOne(query)
                                        .select("results")
                                        .exec());
        return queryGrades;
    }
}
