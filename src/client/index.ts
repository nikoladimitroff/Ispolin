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
}

let viewmodel = new Viewmodel();

let initializeBindings = (courses: ICourseInfo[]) => {
    console.log("JUST Received", courses);
    for (let courseInfo of courses) {
        viewmodel.availableCourses.push(courseInfo);
    }
    ko.applyBindings(viewmodel);
};

Utils.loadJSON("/api/courses", "GET")
     .done(initializeBindings);
