/// <reference path="../../../typings/knockout/knockout.d.ts" />
/// <reference path="../utils.ts" />
/// <reference path="../config.ts" />
/// <reference path="./components.ts" />

namespace PartialViewmodels {
    "use strict";

    export class Resources {
        public resources: Models.IResource[];

        constructor() {
            this.resources = Config.instance.courseInfo.resources;
        }
    }
}
