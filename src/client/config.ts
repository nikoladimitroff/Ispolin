/// <reference path="../../typings/q/Q.d.ts" />
/// <reference path="../common/models.ts" />
/// <reference path="./utils.ts" />

"use strict";



// Helper interface for the frontend. Can't be used on the server.
// If mongo sees the _id property, it won't autogenerate one.
interface IClientCourseInfo extends Models.ICourseInfo {
    getId(): string;
}

class Config {
    public static instance: Config;

    public courseInfo: IClientCourseInfo;
    public isLoggedIn: boolean;
    private loggedStateListeners: ((isLogged: boolean) => void)[];

    constructor() {
        this.loggedStateListeners = [];
    }

    public static initialize(): Q.Promise<any> {
        Config.instance = new Config();
        return Config.instance.loadData();
    }

    public checkLoginStatus(): Q.Promise<boolean> {
        let isLogged = Utils.sendData("/api/check-login", "GET", "");
        isLogged.then((xhr: XMLHttpRequest) => {
            this.isLoggedIn = JSON.parse(xhr.responseText) as boolean;
            this.notifyStateListeners();
        },
                      () => {
            this.isLoggedIn = false;
            this.notifyStateListeners();
        });
        return isLogged;
    }

    public onToggleLogged(listener: () => void): void {
        this.loggedStateListeners.push(listener);
        if (this.isLoggedIn) {
            this.notifyStateListeners();
        }
    }

    private notifyStateListeners(): void {
        for (let listener of this.loggedStateListeners) {
            listener(this.isLoggedIn);
        }
    }

    private loadData(): Q.Promise<any> {
        let course = Utils.loadJSON<Models.ICourseInfo>("/api/course-info");
        course.then((data: Models.ICourseInfo) => {
            let clientCourseInfo = data as any as IClientCourseInfo;
            clientCourseInfo.getId = function (): string {
                return this._id;
            };
            console.log("Course Info", data);
            this.courseInfo = clientCourseInfo;
        });
        let loginPromise = this.checkLoginStatus();

        return Q.all<any>([course, loginPromise]);
    }
}
