/// <reference path="../../../typings/knockout/knockout.d.ts" />
/// <reference path="../../common/models.ts" />
/// <reference path="../utils.ts" />
/// <reference path="../config.ts" />

type IUser = Models.IUser;
namespace PartialViewmodels {
    "use strict";

    interface IUserGrade {
        name: string;
        totalGrade: number;
    }

    export class Standings {
        public standings: KnockoutObservableArray<IUserGrade>;

        constructor() {
            this.standings = ko.observableArray<IUserGrade>();
            this.init();
        }

        private init(): void {
            let initializeBindings = (users: IUser[]) => {
                for (let user of users) {
                    this.standings.push({
                        name: user.name,
                        totalGrade: user.totalGrade
                    });
                }
            };
            let courseId = Config.instance.courseInfo.getId();
            Utils.loadJSON(`/api/users/${courseId}`, "GET")
                 .done(initializeBindings);
        }
    }
}
