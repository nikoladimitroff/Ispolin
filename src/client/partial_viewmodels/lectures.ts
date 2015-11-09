/// <reference path="../../../typings/knockout/knockout.d.ts" />
/// <reference path="../../../typings/reveal/reveal.d.ts" />
/// <reference path="./common.ts" />
/// <reference path="../utils.ts" />
/// <reference path="../config.ts" />

namespace PartialViewmodels {
    "use strict";
    interface IHighlightJS {
        initHighlightingOnLoad(): void;
    }
    declare var hljs: IHighlightJS;

    export class Lectures {
        private lectures: KnockoutObservableArray<Clickable>;
        private activePresentation: KnockoutObservable<string>;
        private activePresentationSourceFile: KnockoutComputed<string>;
        private presentationFrame: HTMLIFrameElement;

        constructor() {
            let frame = document.getElementById("presentation-frame");
            this.presentationFrame = <HTMLIFrameElement>frame;
            this.lectures = ko.observableArray<Clickable>();
            this.activePresentation = ko.observable(null);
            this.activePresentationSourceFile = ko.computed(() => {
                if (!this.activePresentation()) {
                    return null;
                }
                let course = Config.instance.courseInfo.shortName;
                let currentLecture = this.activePresentation();
                return `/courses/${course}/lectures/${currentLecture}`;
            });
            this.init();
        }

        private makeReadable(name: string): string {
            // Remove the numbering and extension
            let regexMatch = name.match(/\w+\.(.+)\.md/);
            if (!regexMatch) {
                return "ERROR: A lecture name is ill-formatted - " + name;
            }
            let cleanName = regexMatch[1];
            // Replace all dots with underscores for easier splitting
            cleanName = cleanName.replace(".", "_");
            let separated = cleanName.split("_").join(" ");
            let firstLetterIndex = separated.match(/[a-z]/).index;
            return separated.substring(0, firstLetterIndex) +
                   separated[firstLetterIndex].toUpperCase() +
                   separated.substring(firstLetterIndex + 1);
        }

        private getClickHandler(lecture: string): ClickHandler {
            return (_: any, eventArgs: MouseEvent): void => {
                eventArgs.preventDefault();
                eventArgs.stopPropagation();
                console.log(lecture);
                this.activePresentation(lecture);
            };
        }

        private changePresentation(newPresentation: string): void {
            console.log(newPresentation);
            localStorage.setItem("activePresentation", newPresentation);
            this.presentationFrame.contentWindow.location.reload();
        }

        private init(): void {
            let lectures = Config.instance.courseInfo.lectures;
            for (let lecture of lectures) {
                this.lectures.push({
                    name: this.makeReadable(lecture),
                    onclick: this.getClickHandler(lecture)
                });
            }
            this.activePresentationSourceFile
                .subscribe(this.changePresentation.bind(this));
        }
    }
}
