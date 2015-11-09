/// <reference path="../../../typings/knockout/knockout.d.ts" />
/// <reference path="../config.ts" />
/// <reference path="uihelpers.ts" />
/// <reference path="../extra_typings.ts" />
/// <reference path="../utils.ts" />

namespace PartialViewmodels {
    "use strict";

    export class LoginViewmodel {
        public email: KnockoutObservable<string>;
        public password: KnockoutObservable<string>;

        private button: UIHelpers.MorphingButton;

        constructor() {
            this.email = ko.observable<string>();
            this.password = ko.observable<string>();
        }
        public login(): void {
            let loginRequest = Utils.sendData("/api/login/", "POST", {
                email: this.email(),
                password: this.password()
            });
            let successOptions = {
                    message: "Login successful!",
                    callback: this.button.toggle.bind(this.button)
            };
            loginRequest.done(() => {
                vex.dialog.alert(successOptions);
                Config.instance.checkLoginStatus();
            },
                              (xhr) => {
                if (xhr.status === 401) {
                    vex.dialog.alert("Invalid email or password");
                } else {
                    vex.dialog.alert("Unknown error occurred");
                }
                Config.instance.checkLoginStatus();
            });
        }

        public postRender(): void {
            let selector = ".login-morphing-button.morph-button";
            let morphingButton = <HTMLElement>document.querySelector(selector);
            this.button = new UIHelpers.MorphingButton(morphingButton);
        };
    }

    export class LogoutViewmodel {
        public logout(): void {
            let logoutRequest = Utils.sendData("/api/logout", "GET", "");
            // Logging out requires page reload :/
            logoutRequest.done(() => window.location.reload());
        }
    }

    export class SignupViewmodel {
        public name: KnockoutObservable<string>;
        public email: KnockoutObservable<string>;
        public fn: KnockoutObservable<string>;
        public password: KnockoutObservable<string>;
        public confirmPassword: KnockoutObservable<string>;

        private button: UIHelpers.MorphingButton;
        constructor() {
            this.name = ko.observable<string>();
            this.email = ko.observable<string>();
            this.fn = ko.observable<string>();
            this.password = ko.observable<string>();
            this.confirmPassword = ko.observable<string>();
        }
        public signup(): void {
            let signupRequest = Utils.sendData("/api/signup/", "POST", {
                name: this.name(),
                email: this.email(),
                fn: this.fn(),
                password: this.password(),
                confirmPassword: this.confirmPassword()
            });
            let successOptions = {
                    message: "Signup successful!",
                    callback: this.button.toggle.bind(this.button)
            };
            signupRequest.done(() => vex.dialog.alert(successOptions),
                               (xhr) => vex.dialog.alert(xhr.responseText));
        }

        public postRender(): void {
            let selector = ".signup-morphing-button.morph-button";
            let morphingButton = <HTMLElement>document.querySelector(selector);
            this.button = new UIHelpers.MorphingButton(morphingButton);
        };
    }
}
