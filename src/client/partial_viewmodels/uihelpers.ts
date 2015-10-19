module UIHelpers {
    "use strict";

    class Keys {
        public static еscape: number = 27;
    }

    // Trick to prevent scrolling when opening/closing button
    module MorphingButtonHelpers {
        let documentElement = window.document.documentElement;
        let didScroll = false;
        let scrollPosition = {
            x: 0,
            y: 0
        };
        function fixedScrollHandler(): void {
            window.scrollTo(scrollPosition.x, scrollPosition.y);
        };

        function scrollPage(): void {
            scrollPosition = {
                x : window.pageXOffset || documentElement.scrollLeft,
                y : window.pageYOffset || documentElement.scrollTop
            };
            didScroll = false;
        };

        function scrollHandler(): void {
            if (!didScroll) {
                didScroll = true;
                setTimeout(scrollPage, 60);
            }
        };

        function disableScrolling(): void {
            window.removeEventListener("scroll", scrollHandler);
            window.addEventListener("scroll", fixedScrollHandler);
        };

        function enableScrolling(): void {
            window.removeEventListener("scroll", fixedScrollHandler);
            window.addEventListener("scroll", scrollHandler);
        }
        export function onBeforeOpen(): void {
            disableScrolling();
        }
        export function onAfterOpen(domTarget: HTMLElement): void {
            enableScrolling();
            document.body.classList.add("noscroll");
            domTarget.classList.add("scroll");
        }
        export function onBeforeClose(domTarget: HTMLElement): void {
            document.body.classList.remove("noscroll");
            domTarget.classList.remove("scroll");
            disableScrolling();
        }
        export function onAfterClose(): void {
            enableScrolling();
        }
        enableScrolling();
    }

    export class MorphingButton {
        private container: HTMLElement;
        private button: HTMLButtonElement;
        private closeButton: HTMLElement;
        private content: HTMLElement;
        private isExpanded: boolean;
        private isAnimating: boolean;

        public constructor(domTarget: HTMLElement) {
            this.container = domTarget;
            this.button = <HTMLButtonElement>domTarget
                                             .querySelector("button");
            this.content = <HTMLElement>domTarget
                                        .querySelector(".morph-content");
            this.closeButton = <HTMLElement>domTarget
                                            .querySelector(".close-button");
            this.isExpanded = false;
            this.initEvents();
        }

        public toggle(): void {
            if (this.isAnimating) {
                return;
            }

            if (this.isExpanded) {
                MorphingButtonHelpers.onBeforeClose(this.container);
            } else {
                this.container.classList.add("active");
                MorphingButtonHelpers.onBeforeOpen();
            }

            this.isAnimating = true;

            let onEndTransition = (eventArgs: TransitionEvent) => {
                if (eventArgs.target !== this.content) {
                    return;
                }

                this.content.removeEventListener("transitionend",
                                                 onEndTransition);
                this.isAnimating = false;

                if (this.isExpanded) {
                   this.container.classList.remove("active");
                   MorphingButtonHelpers.onAfterClose();
                } else {
                    MorphingButtonHelpers.onAfterOpen(this.container);
                }
                this.isExpanded = !this.isExpanded;
            };

            this.content.addEventListener("transitionend", onEndTransition);

            this.content.classList.add("no-transition");
            this.content.style.left = "auto";
            this.content.style.top = "auto";

            let toggleButtonOpen = () => {
                let buttonPos = this.button.getBoundingClientRect();
                this.content.style.left = buttonPos.left + "px";
                this.content.style.top = buttonPos.top + "px";

                if (this.isExpanded) {
                    this.content.classList.remove("no-transition");
                    this.container.classList.remove("open");
                } else {
                    let asyncOpen = () => {
                        this.content.classList.remove("no-transition");
                        this.container.classList.add("open");
                    };
                    setTimeout(asyncOpen, 25);
                }
            };
            setTimeout(toggleButtonOpen, 25);
        }

        private initEvents(): void {
            this.button.addEventListener("click", this.toggle.bind(this));
            this.closeButton.addEventListener("click", this.toggle.bind(this));
            let onKeyDown = (eventArgs: KeyboardEvent) => {
                let keycode = eventArgs.keyCode || eventArgs.which;
                if (keycode === Keys.еscape && this.isExpanded) {
                    this.toggle();
                }
            };
            document.body.addEventListener("keydown", onKeyDown);
        }
    }
}
