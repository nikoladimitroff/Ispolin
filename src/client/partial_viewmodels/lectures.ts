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
    interface ILecture {
        sourceFile: string;
        readableName: string;
    }
    declare var hljs: IHighlightJS;

    export class Lectures {
        public lectures: ILecture[];
        public activePresentation: KnockoutObservable<ILecture>;

        private presentationFrame: HTMLIFrameElement;

        constructor() {
            let frame = document.getElementById("presentation-frame");
            this.presentationFrame = <HTMLIFrameElement>frame;
            this.setPresentationFrameURL();



            this.lectures = Config.instance.courseInfo.lectures.map(lecture => {
                return {
                    sourceFile: lecture,
                    readableName: this.makeReadable(lecture)
                };
            });
            this.activePresentation = ko.observable(null);
            this.activePresentation
                .subscribe(this.updatePresentation.bind(this));
            this.updatePresentation();
            // Magic code follows:
            // The browser won't load the iframe if it is added directly by ko,
            // so we instead hide it, and then set it it something meaningful
            // after a timeout
            setTimeout(() => this.onLectureClicked(this.lectures[0]), 0);
        }

        public onLectureClicked(lecture: ILecture): void {
            this.activePresentation(lecture);
        }

        private makeReadable(name: string): string {
            // Remove the numbering and extension
            let regexMatch = name.match(/\w+\.(.+)\.md/);
            if (!regexMatch) {
                console.error("A lecture name is ill-formatted - " + name);
                return name;
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

        private updatePresentation(): void {
            if (!this.activePresentation()) {
                return;
            }
            let course = Config.instance.courseInfo.shortName;
            let currentLecture = this.activePresentation().sourceFile;
            let lecturePath = `/courses/${course}/lectures/${currentLecture}`;
            localStorage.setItem("activePresentation", lecturePath);
            this.presentationFrame.contentWindow.location.reload();
        }

        private setPresentationFrameURL(): void {
            let courseName = Config.instance.courseInfo.shortName;
            let presentationFrameURL = `/courses/${courseName}` +
                                       "/lectures/presentation-iframe.html";
            const key = "coursePresentationFrameURL";
            localStorage.setItem(key, presentationFrameURL);
        }
    }
}
