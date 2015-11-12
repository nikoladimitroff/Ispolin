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
                let totalGrade = 0;
                let totalMaxGrade = 0;
                let totalRunningTime = 0;
                for (let grade of grades) {
                    this.grades.push(grade);
                    totalGrade += grade.grade;
                    totalMaxGrade += grade.max;
                    totalRunningTime += grade.runningTime;
                }
                // Add the total only if at least one grade was there
                if (grades.length !== 0) {
                    let total: Models.IGrade = {
                        source: "Total",
                        grade: totalGrade,
                        max: totalMaxGrade,
                        runningTime: totalRunningTime
                    };
                    this.grades.push(total);
                }
            };
            let courseShortName = Config.instance.courseInfo.shortName;
            Utils.loadJSON(`/api/results/${courseShortName}`, "POST")
                 .done(initializeBindings);
        }

        private translateStatus(homeworkStatus: Models.HomeworkStatus): string {
            const status = Models.HomeworkStatus;
            switch (homeworkStatus) {
                case status.NotCompiling: return "Does not compile";
                case status.Crashing: return "Crashes or throws";
                case status.WrongResult: return "Wrong output";
                case status.Working: return "Works";
                default: return "-";
            }
        }
    }
}
