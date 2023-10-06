export interface IBlockColors {
    textColor: number;
    backgroundColor: number;
}

export interface IBlockStyle {
    backgroundTexture: PIXI.Texture;
    smallFontName: string;
    smallFontSize: number;
    mediumFontName: string;
    mediumFontSize: number;
    largeFontName: string;
    largeFontSize: number;
    xLargeFontName: string;
    xLargeFontSize: number;
    xxLargeFontName: string;
    xxLargeFontSize: number;
    colors: { [key: number]: IBlockColors };
}

export interface IBlockOptions {
    size: number;
    style: IBlockStyle;
}

export enum EBlockMode {
    IDLE = 0,
    MOVE,
    MOVE_AND_MERGE,
    MERGE
}

export default class Block extends PIXI.Sprite {
    private _style: IBlockStyle;
    private _text: PIXI.BitmapText;
    private _value: number;
    mode: EBlockMode = EBlockMode.IDLE;

    constructor(options: IBlockOptions) {
        super();
        this._style = options.style;
        this.width = options.size;
        this.height = options.size;
        this.anchor.set(0.5, 0.5);

        // Set background texture
        this.texture = options.style.backgroundTexture;

        // Create the label
        this._text = new PIXI.BitmapText("", {
            fontName: options.style.smallFontName
        });
        this._text.anchor = new PIXI.Point(0.5, 0.5);
        this._text.position.set(0, 0);
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
        if (this._style.colors[val].textColor === undefined) {
            console.log("undef ", val);
        }
        this._text.tint = this._style.colors[val].textColor;
        this.tint = this._style.colors[val].backgroundColor;
        if (len < 2) {
            this._text.fontName = this._style.smallFontName;
            this._text.fontSize = this._style.smallFontSize;
        } else if (len < 3) {
            this._text.fontName = this._style.mediumFontName;
            this._text.fontSize = this._style.mediumFontSize;
        } else if (len < 4) {
            this._text.fontName = this._style.largeFontName;
            this._text.fontSize = this._style.largeFontSize;
        } else if (len < 5) {
            this._text.fontName = this._style.xLargeFontName;
            this._text.fontSize = this._style.xLargeFontSize;
        } else {
            this._text.fontName = this._style.xxLargeFontName;
            this._text.fontSize = this._style.xxLargeFontSize;
        }
    }
}
