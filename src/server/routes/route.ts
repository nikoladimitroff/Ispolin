import restify = require("restify");

"use strict";
export interface IRoute {
    handleRequest(req: restify.Request,
                  res: restify.Response,
                  next: restify.Next): void;
};
