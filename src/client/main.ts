/// <reference path="../../typings/knockout/knockout.d.ts" />
/// <reference path="./partial_viewmodels/link.ts" />
/// <reference path="./utils.ts" />

type Link = PartialViewmodels.Link;

class Viewmodel {
    public mainMenu: KnockoutObservableArray<Link>;
    public activeView: KnockoutObservable<string>;

    constructor() {
        this.mainMenu = ko.observableArray<Link>();
        this.activeView = ko.observable("view!home");
    }

    public changeView(nextView: string): void {
        this.activeView("view!" + nextView);
    }
}

let viewmodel = new Viewmodel();

interface IClassMap {
    [name: string]: Function;
}

let getViewmodelForComponent = function (fullName: string): Function {
    // Remove the view! or component! part
    let shortName = fullName.substr(fullName.indexOf("!") + 1);
    // Capitalize
    shortName = shortName[0].toUpperCase() + shortName.substr(1);
    return (<IClassMap><any>PartialViewmodels)[shortName];
};

let registerComponents = function (): void {
    let componentTemplates = document.querySelectorAll(".component");
    for (let i = 0; i < componentTemplates.length; i++) {
        let component = <HTMLElement>(componentTemplates.item(i));
        ko.components.register(component.id, {
            viewModel: getViewmodelForComponent(component.id),
            template: component.innerHTML
        });
    }
};

type TranslationSubmap = { [entry: string]: string };
interface ITranslationMap {
    mainMenu: TranslationSubmap;
}

let initializeBindings = function (translation: ITranslationMap): void {
    let mainMenuItems = translation.mainMenu;
    for (let itemName in mainMenuItems) {
        let item = new PartialViewmodels.Link(mainMenuItems[itemName],
                                              itemName);
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
