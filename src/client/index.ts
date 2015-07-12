/// <reference path="../../typings/knockout/knockout.d.ts" />
/// <reference path="./utils.ts" />

class CourseInfo {
    public name: string;
    public link: string;
    public description: string;

    constructor(name: string, link: string, description: string) {
        this.name = name;
        this.link = link;
        this.description = description;
    }
}

class Viewmodel {
    public availableCourses: KnockoutObservableArray<CourseInfo>;

    constructor() {
        this.availableCourses = ko.observableArray<CourseInfo>();
    }
}

let viewmodel = new Viewmodel();
type CourseMap = { [name: string]: {link: string, description: string} };

let initializeBindings = (courses: CourseMap) => {
   Object.keys(courses).forEach((course: string) => {
        let info = new CourseInfo(course,
                                  courses[course].link,
                                  courses[course].description);
        viewmodel.availableCourses.push(info);
   });
   ko.applyBindings(viewmodel);
};

Utils.loadJSON("/api/courses", "GET")
     .done(initializeBindings);
