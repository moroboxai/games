import { Position, Tile } from "./utils";

export interface IBlockColors {
    textColor: number;
    backgroundColor: number;
}

export interface IBlockStyle {
    backgroundTexture: PIXI.Texture;
    fontName: string;
    smallFontSize: number;
    mediumFontSize: number;
    largeFontSize: number;
    xLargeFontSize: number;
    xxLargeFontSize: number;
    colors: { [key: number]: IBlockColors };
}

export interface IBlockOptions {
    size: number;
    style: IBlockStyle;
}

export default class Block extends PIXI.Sprite {
    private _style: IBlockStyle;
    private _text: PIXI.BitmapText;
    private _value: number;
    targetPosition: Position;

    constructor(options: IBlockOptions) {
        super();
        this._style = options.style;
        this.width = options.size;
        this.height = options.size;

        // Set background texture
        this.texture = options.style.backgroundTexture;

        // Create the label
        this._text = new PIXI.BitmapText("", {
            fontName: "MoroboxAIRetro"
        });
        this._text.anchor = new PIXI.Point(0.5, 0.5);
        this._text.position.set(this.width / 2, this.height / 2);
        this.addChild(this._text);

        this.value = 2;
    }

    get value(): number {
        return this._value;
    }

    set value(val: number) {
        this._value = val;
        const text = val.toString();
        const len = text.length;
        this._text.text = text;
        this._text.tint = this._style.colors[val].textColor;
        this.tint = this._style.colors[val].backgroundColor;
        if (len < 2) {
            this._text.fontSize = this._style.smallFontSize;
        } else if (len < 3) {
            this._text.fontSize = this._style.mediumFontSize;
        } else if (len < 4) {
            this._text.fontSize = this._style.largeFontSize;
        } else if (len < 5) {
            this._text.fontSize = this._style.xLargeFontSize;
        } else {
            this._text.fontSize = this._style.xxLargeFontSize;
        }
    }
}
