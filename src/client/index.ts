/// <reference path="../../typings/knockout/knockout.d.ts" />

var viewmodel = {
    availableCourses: ko.observableArray(),
    error: ko.observable("")
};

let xhr = new XMLHttpRequest();

xhr.onreadystatechange = function() {
    if (xhr.readyState == XMLHttpRequest.DONE ) {
       if(xhr.status == 200){
           var json = JSON.parse(xhr.responseText);
           console.log(json);
           Object.keys(json).forEach(function (course) {
                viewmodel.availableCourses.push({
                    name: course,
                    link: json[course].link,
                    description: json[course].description
                });
           });
       }
       else {
            viewmodel.error("Sorry, could not load the list of available courses.");
       }
       ko.applyBindings(viewmodel);
    }
}

xhr.open("GET", "/api/courses", true);
xhr.send();