/// <reference path="../../../typings/knockout/knockout.d.ts" />
/// <reference path="../../common/models.ts" />
/// <reference path="../extra_typings.ts" />
/// <reference path="../utils.ts" />
/// <reference path="../config.ts" />
/// <reference path="uihelpers.ts" />

type IHomework = Models.IHomework;
namespace PartialViewmodels {
    "use strict";

    export class Homeworks {
        public availableHomeworks: IHomework[];
        public homeworkContents: KnockoutObservable<string>;

        private homeworkButtons: UIHelpers.MorphingButton[];
        // Property instead of proper func because it needs to capture this
        private postRender: () => void;

        constructor() {
            this.availableHomeworks = Config.instance.courseInfo
                                                     .availableHomeworks;
            this.homeworkContents = ko.observable<string>();

            this.homeworkButtons = [];

            this.postRender = () => {
                // Initialize the buttons
                let selector = "#available-homeworks-list .morph-button";
                let morphingButtons = document.querySelectorAll(selector);
                for (let i = 0; i < morphingButtons.length; i++) {
                    let button = <HTMLElement>morphingButtons.item(i);
                    let morphing = new UIHelpers.MorphingButton(button);
                    this.homeworkButtons.push(morphing);
                }
            };
        }

        public submit(homeworkName: string): void {
            let courseShortName = Config.instance.courseInfo.shortName;
            let url = `/api/homework/${courseShortName}`;
            let request = Utils.sendData(url, "POST", {
                name: homeworkName,
                solution: this.homeworkContents()
            });
            let homeworkIndex = -1;
            for (let i = 0; i < this.availableHomeworks.length; i++) {
                let homework = this.availableHomeworks[i];
                if (homework.title === homeworkName) {
                    homeworkIndex = i;
                    break;
                }
            }
            let activeButton = this.homeworkButtons[homeworkIndex];
            let successOptions = {
                    message: "Solution sent successfully! " +
                             "See the results page.",
                    callback: activeButton.toggle.bind(activeButton)
            };

            let errorMessage = "There was a problem, try again later";
            request.done(() => vex.dialog.alert(successOptions),
                         () => vex.dialog.alert(errorMessage));
        }
    }
}
