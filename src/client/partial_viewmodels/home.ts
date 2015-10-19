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

        constructor() {
            let courseName = Config.instance.courseInfo.name;
            this.courseName = ko.observable(courseName);
            let shortName = Config.instance.courseInfo.shortName.toLowerCase();
            let welcomeImagePath = `resources/${shortName}/welcome.png`;
            this.welcomeImage = ko.observable(welcomeImagePath);
            this.loginVM = new LoginViewmodel();
            this.logoutVM = new LogoutViewmodel();
            this.signupVM = new SignupViewmodel();
        }
    }
}
