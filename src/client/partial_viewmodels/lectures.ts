/// <reference path="../../../typings/knockout/knockout.d.ts" />
/// <reference path="./link.ts" />
/// <reference path="../utils.ts" />

module PartialViewmodels {
    "use strict";
    export class Lectures {
        public lectures: KnockoutObservableArray<Link>;

        constructor() {
            this.lectures = ko.observableArray<Link>();
            this.init();
        }

        private makeReadable(name: string): string {
            // Remove the numbering and extension
            let cleanName = name.match(/\w+\.(.+)\.md/)[1];
            // Replace all dots with underscores for easier splitting
            cleanName = cleanName.replace(".", "_");
            let separated = cleanName.split("_").join(" ");
            let firstLetterIndex = separated.match(/[a-z]/).index;
            return separated.substring(0, firstLetterIndex) +
                   separated[firstLetterIndex].toUpperCase() +
                   separated.substring(firstLetterIndex + 1);
        }

        private init(): void {
            let initializeBindings = (lectures: string[]) => {
                for (let lecture of lectures) {
                    this.lectures.push({
                        name: this.makeReadable(lecture),
                        link: `lectures/${lecture}`
                    });
                }
            };
            Utils.loadJSON("/api/lectures", "GET")
                 .done(initializeBindings);
        }
    }
}
