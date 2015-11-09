/// <reference path="../../../typings/knockout/knockout.d.ts" />
/// <reference path="../utils.ts" />
/// <reference path="../config.ts" />
/// <reference path="./components.ts" />

namespace PartialViewmodels {
    "use strict";

    export class Home {
        public courseName: KnockoutObservable<string>;
        public welcomeImage: KnockoutObservable<string>;
        public loginVM: LoginViewmodel;
        public logoutVM: LogoutViewmodel;
        public signupVM: SignupViewmodel;
        public news: string[];
        public activeNews: KnockoutObservable<number>;

        constructor() {
            let courseName = Config.instance.courseInfo.name;
            this.courseName = ko.observable(courseName);
            let shortName = Config.instance.courseInfo.shortName.toLowerCase();
            let welcomeImagePath = `/courses/${shortName}/welcome.png`;
            this.welcomeImage = ko.observable(welcomeImagePath);
            this.loginVM = new LoginViewmodel();
            this.logoutVM = new LogoutViewmodel();
            this.signupVM = new SignupViewmodel();
            this.news = Config.instance.courseInfo.news;
            this.activeNews = ko.observable(0);
        }

        public changeNews(index: number): void {
            let current = this.activeNews();
            let maxIndex = this.news.length - 1;
            let newValue = Math.max(Math.min(current + index, maxIndex), 0);
            this.activeNews(newValue);
        }
    }
}
