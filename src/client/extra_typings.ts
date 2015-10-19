declare interface IVexButton {}

declare interface IVexDialogOPtions {
    message: string;
    callback?: (value: string | boolean) => void;
    input?: string;
    buttons?: IVexButton;
}

declare interface IVexDialog  {
    alert(messageOrOptions: string | IVexDialogOPtions): void;
    confirm(options: IVexDialogOPtions): void;
    prompt(options: IVexDialogOPtions): void;
    error(options: IVexDialogOPtions): void;
}

declare class Vex {
    dialog: IVexDialog;
}

declare var vex: Vex;
