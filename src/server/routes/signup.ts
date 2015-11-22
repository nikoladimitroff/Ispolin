/// <reference path="../../common/models.ts" />

"use strict";
import restify = require("restify");
import Q = require("q");
import { IRoute } from "./route";
import { Logger } from "../logger";
import { DataAccessLayer } from "../data_access_layer";
import { SchemaModels } from "../schemas";
import { Validator } from "../validator";

type IUser = SchemaModels.IUser;

export class Signup implements IRoute {

    public handleRequest(req: restify.Request,
                         res: restify.Response,
                         next: restify.Next): void {

        let name = req.body.name;
        let password = req.body.password;
        let fn = req.body.fn;
        let mail = req.body.email;

        if (!name || name.length === 0) {
            res.send(400, "It is required to enter your name");
            return;
        }
        if (!Validator.validateFacultyNumber(fn)) {
            res.send(400, "Please enter a valid faculty number");
            return;
        }
        if (!Validator.validateEmail(mail)) {
            res.send(400, "Please enter a valid email address");
            return;
        }
        if (!Validator.validatePasswordStrength(password)) {
            res.send(400, Validator.weakPasswordMessage);
            return;
        }
        if (password !== req.body.confirmPassword) {
            res.send(400, "Passwords don't match");
            return;
        }
        // Check for duplicates

        let queryFn = Q(SchemaModels.User
                                    .findOne({fn: fn})
                                    .exec());
        let queryMail = Q(SchemaModels.User
                                      .findOne({mail: mail})
                                      .exec());
        let testDuplicates = (duplicates: IUser[]) => {
            let fnDuplicate: IUser = duplicates[0];
            let mailDuplicate: IUser = duplicates[1];
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
        let password = req.body.password;
        let salt = Validator.newSalt();
        let user = new SchemaModels.User({
            name: req.body.name,
            passportHash: Validator.hashPassword(password, salt),
            salt: salt,
            mail: req.body.email,
            fn: req.body.fn
        });
        let onsuccess = () => {
            Logger.info("New user: {0}", user);
            res.send(200, "");
        };
        let onerror = (error: Error) => res.send(500, JSON.stringify(error));
        DataAccessLayer.saveAll([user])
                       .done(onsuccess, onerror);
    }
}
