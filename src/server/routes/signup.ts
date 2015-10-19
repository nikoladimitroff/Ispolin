/// <reference path="../../common/models.ts" />

"use strict";
import restify = require("restify");
import Q = require("q");
import { IRoute } from "./route";
import DataAccessLayer from "../data_access_layer";
import { SchemaModels } from "../schemas";
import { Validator } from "../validator";

type IUser = SchemaModels.IUser;

export class Signup implements IRoute {

    public handleRequest(req: restify.Request,
                         res: restify.Response,
                         next: restify.Next): void {

        // Check for duplicates
        let fn = req.body.fn;
        let mail = req.body.email;

        let queryFn = Q(SchemaModels.User
                                    .findOne({fn: fn})
                                    .exec());
        let queryMail = Q(SchemaModels.User
                                      .findOne({mail: mail})
                                      .exec());
        let testDuplicates = (duplicates: IUser[]) => {
            let fnDuplicate: IUser = duplicates[0];
            let mailDuplicate: IUser = duplicates[1];
            console.log(duplicates);
            if (fnDuplicate !== null) {
                let message = "A student has already been registered " +
                              "with this faculty number";
                res.send(400, message);
                return;
            }
            if (mailDuplicate !== null) {
                let message = "A student has already been registered " +
                              "with this email address";
                res.send(400, message);
                return;
            }
            this.saveUser(req, res);
        };
        let onError = (error: Error) => res.send(500, error);
        Q.all([queryFn, queryMail]).done(testDuplicates, onError);
    }

    private saveUser(req: restify.Request,
                     res: restify.Response): void {
        let users: SchemaModels.IUser[] = [
            new SchemaModels.User({
                name: req.body.name,
                passportHash: Validator.hashPassword(req.body.password),
                mail: req.body.email,
                fn: req.body.fn
            })
        ];
        let onsuccess = () => res.send(200, "");
        let onerror = (error: Error) => res.send(500, JSON.stringify(error));
        DataAccessLayer.instance.saveAll(users)
                                .done(onsuccess, onerror);
    }
}
