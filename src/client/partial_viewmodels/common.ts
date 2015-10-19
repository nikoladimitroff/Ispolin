type ClickHandler = (data: any, args: MouseEvent) => void;
namespace PartialViewmodels {
    "use strict";
    export class Link {
        public name: string;
        public link: string;
        public icon: string;

        constructor(name: string, link: string, icon?: string) {
            this.name = name;
            this.link = link;
            this.icon = icon;
        }
    }

    export class MenuItem extends Link {
        public requiresLogin: boolean;

        constructor(name: string,
                    link: string,
                    icon?: string,
                    requiresLogin?: boolean) {
            super(name, link, icon);
            this.requiresLogin = requiresLogin;
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
