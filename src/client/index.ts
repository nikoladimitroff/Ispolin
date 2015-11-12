/// <reference path="../../typings/knockout/knockout.d.ts" />
/// <reference path="./utils.ts" />
/// <reference path="../common/models.ts" />

"use strict";

type ICourseInfo = Models.ICourseInfo;

class Viewmodel {
    public availableCourses: KnockoutObservableArray<ICourseInfo>;

    constructor() {
        this.availableCourses = ko.observableArray<ICourseInfo>();
    }

    public storeCourseName(course: string): boolean {
        localStorage.setItem("lastSelectedCourse", course);
        // Return true so we don't block the link
        return true;
    }
}

let viewmodel = new Viewmodel();

let initializeBindings = (courses: ICourseInfo[]) => {
    for (let courseInfo of courses) {
        viewmodel.availableCourses.push(courseInfo);
    }
    ko.applyBindings(viewmodel);
};

Utils.loadJSON("/api/courses").done(initializeBindings);
