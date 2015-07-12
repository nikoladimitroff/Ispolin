/// <reference path="../../typings/knockout/knockout.d.ts" />
/// <reference path="./utils.ts" />

class MenuItem {
    public name: string;
    public link: string;

    constructor(name: string, link: string) {
        this.name = name;
        this.link = link;
    }
}

class Viewmodel {
    public mainMenu: KnockoutObservableArray<MenuItem>;
    public activeView: KnockoutObservable<string>;

    constructor() {
        this.mainMenu = ko.observableArray<MenuItem>();
        this.activeView = ko.observable("view!home");
    }

    public changeView(nextView: string): void {
        this.activeView("view!" + nextView);
    }
}

let viewmodel = new Viewmodel();

let registerComponents = () => {
    let componentTemplates = document.querySelectorAll(".component");
    for (let i = 0; i < componentTemplates.length; i++) {
        let component = <HTMLElement>(componentTemplates.item(i));
        ko.components.register(component.id, {
            template: component.innerHTML
        });
    }
};

type TranslationSubmap = { [entry: string]: string };
interface ITranslationMap {
    mainMenu: TranslationSubmap;
}

let initializeBindings = (translation: ITranslationMap): void => {
    let mainMenuItems = translation.mainMenu;
    for (let itemName in mainMenuItems) {
        let item = new MenuItem(mainMenuItems[itemName], itemName);
        viewmodel.mainMenu.push(item);
    }
    ko.applyBindings(viewmodel);
};

let main = (): void => {
    registerComponents();
    Utils.loadJSON("/resources/translation.json", "GET")
         .done(initializeBindings);
};

document.addEventListener("DOMContentLoaded", main);
