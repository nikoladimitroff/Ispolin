/// <reference path="../../typings/q/Q.d.ts" />
/// <reference path="../common/models.ts" />
/// <reference path="./utils.ts" />

"use strict";

class Config {
    public static instance: Config;

    public courseInfo: Models.ICourseInfo;

    public static initialize(): Q.Promise<any> {
        Config.instance = new Config();
        return Q.all([Config.instance.loadData()]);
    }

    private loadData(): Q.Promise<Models.ICourseInfo> {
        let promise = Utils.loadJSON<Models.ICourseInfo>("/api/course-info");
        promise.then((data: Models.ICourseInfo) => {
            console.log(data);
            this.courseInfo = data;
        });

        return promise;
    }
}
