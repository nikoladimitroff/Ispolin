import restify = require("restify");
import { IRoute } from "./route";
import DataAccessLayer from "../data_access_layer";
import { SchemaModels } from "../schemas";

type ICourseInfo = SchemaModels.ICourseInfo;
type IUser = SchemaModels.IUser;

export module Routes {
    "use strict";
    export class Users implements IRoute {

        public handleRequest(req: restify.Request,
                             res: restify.Response,
                             next: restify.Next): void {
            console.log("here we are!");
            let availableUsers = SchemaModels.User
                                             .find({})
                                             .select("results totalGrade name")
                                             .sort("totalGrade name")
                                             .exec();
            let onSuccess = (result: IUser[]) => {
                console.log("####", result);
                res.send(200, result);
            };
            console.log("over here");
            availableUsers.then(onSuccess, DataAccessLayer.instance.onError);
        }
    }
}
