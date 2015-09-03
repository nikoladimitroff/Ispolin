type ClickHandler = (data: any, args: MouseEvent) => void;
namespace PartialViewmodels {
    "use strict";
    export class Link {
        public name: string;
        public link: string;

        constructor(name: string, link: string) {
            this.name = name;
            this.link = link;
        }
    }

    export class Clickable {
        public name: string;
        public onclick: ClickHandler;

        constructor(name: string, onclick: ClickHandler) {
            this.name = name;
            this.onclick = onclick;
        }
    }
}
