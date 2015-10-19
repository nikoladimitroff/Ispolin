/// <reference path="../../typings/q/Q.d.ts" />
/// <reference path="../common/models.ts" />
/// <reference path="./utils.ts" />

"use strict";

class Config {
    public static instance: Config;

    public courseInfo: Models.ICourseInfo;
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
            console.log(data);
            this.courseInfo = data;
        });
        let loginPromise = this.checkLoginStatus();

        return Q.all<any>([course, loginPromise]);
    }
}
