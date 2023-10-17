import type { IVM } from "piximoroxel8ai";

// Instance of the VM
declare const vm: IVM;

export interface IHeaderStyle {
    backgroundTexture: PIXI.Texture;
    fontName: string;
    fontSize: number;
}

export interface IHeaderOptions {
    width: number;
    height: number;
    style: IHeaderStyle;
}

export default class Header extends vm.PIXI.Container {
    private _text: PIXI.BitmapText;

    constructor(options: IHeaderOptions) {
        super();

        // Create the background sprite
        const background = new vm.PIXI.Sprite(options.style.backgroundTexture);
        background.width = options.width;
        background.height = options.height;
        this.addChild(background);

        // Create the text
        this._text = new vm.PIXI.BitmapText("", {
            fontName: options.style.fontName,
            fontSize: options.style.fontSize
        });
        this._text.anchor = new vm.PIXI.Point(0.5, 1);
        this._text.position.set(background.width / 2, background.height);
        this.addChild(this._text);
    }

    set score(val: number) {
        this._text.text = val.toString();
    }

    reset() {
        this.score = 0;
    }
}
