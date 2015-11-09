/// <reference path="../../typings/knockout/knockout.d.ts" />
/// <reference path="./partial_viewmodels/common.ts" />
/// <reference path="./utils.ts" />
/// <reference path="./config.ts" />


type MenuItem = PartialViewmodels.MenuItem;

class ApplicationViewmodel {
    public mainMenu: KnockoutObservableArray<MenuItem>;
    public activeView: KnockoutObservable<string>;
    public isLoggedIn: KnockoutObservable<boolean>;

    constructor() {
        this.mainMenu = ko.observableArray<MenuItem>();
        this.activeView = ko.observable<string>();
        this.isLoggedIn = ko.observable<boolean>(false);
    }

    public changeView(nextView: string): void {
        let item = this.getMenuItem(nextView) || {} as MenuItem;
        if (item.requiresLogin && !this.isLoggedIn()) {
            alert("Seeing " + item.name + " requires you to be logged in!");
            return;
        }
        this.activeView("view!" + nextView);
    }

    private getMenuItem(itemName: string): MenuItem {
        for (let item of this.mainMenu()) {
            if (item.link === itemName) {
                return item;
            }
        }
        return null;
    }
}

let appViewmodel = new ApplicationViewmodel();

interface IClassMap {
    [name: string]: Function;
}

let getViewmodelForComponent = function (fullName: string): Function {
    // Remove the view! or component! part
    let shortName = fullName.substr(fullName.indexOf("!") + 1);
    // Capitalize
    shortName = shortName[0].toUpperCase() + shortName.substr(1);
    shortName = shortName.replace(/_[a-z]/g, (replacement) => {
        return replacement[1].toUpperCase();
    });
    let partialViewmodel = (<IClassMap><any>PartialViewmodels)[shortName];
    if (partialViewmodel) {
        return partialViewmodel;
    }
    // If there's no partial viewmodel available, create a params proxy
    return function (params: Object): Object {
        return params;
    };
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


let initializeBindings = function (): void {
    let mainMenuItems = Config.instance.courseInfo.translations.mainMenu;
    for (let itemName in mainMenuItems) {
        let text = mainMenuItems[itemName].text;
        let link = itemName;
        let icon = mainMenuItems[itemName].icon;
        let requiresLogin = mainMenuItems[itemName].requiresLogin;
        let item = new PartialViewmodels.MenuItem(text, link,
                                                  icon, requiresLogin);
        appViewmodel.mainMenu.push(item);
    }
    ko.applyBindings(appViewmodel);
};

let main = (): void => {
    let initializeConfig = Config.initialize();
    Config.instance.onToggleLogged(appViewmodel.isLoggedIn);

    initializeConfig.then(() => appViewmodel.changeView("home"))
                    .done(initializeBindings);
    registerComponents();
};

document.addEventListener("DOMContentLoaded", main);
