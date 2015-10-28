/// <reference path="../../../typings/knockout/knockout.d.ts" />
/// <reference path="../../common/models.ts" />
/// <reference path="../utils.ts" />
/// <reference path="../config.ts" />

type IUser = Models.IUser;
namespace PartialViewmodels {
    "use strict";

    export class Results {
        public grades: KnockoutObservableArray<Models.IGrade>;

        constructor() {
            this.grades = ko.observableArray<Models.IGrade>();
            this.init();
        }

        private init(): void {
            let initializeBindings = (grades: Models.IGrade[]) => {
                for (let grade of grades) {
                    this.grades.push(grade);
                }
            };
            let courseId = Config.instance.courseInfo.getId();
            Utils.loadJSON(`/api/results/${courseId}`, "POST")
                 .done(initializeBindings);
        }
    }
}
