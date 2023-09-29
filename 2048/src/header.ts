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

export default class Header extends PIXI.Container {
    private _text: PIXI.BitmapText;
    private _score: number;

    constructor(options: IHeaderOptions) {
        super();

        // Create the background sprite
        const background = new PIXI.Sprite(options.style.backgroundTexture);
        background.width = options.width;
        background.height = options.height;
        this.addChild(background);

        // Create the text
        this._text = new PIXI.BitmapText("", {
            fontName: options.style.fontName,
            fontSize: options.style.fontSize
        });
        this._text.anchor = new PIXI.Point(0.5, 1);
        this._text.position.set(background.width / 2, background.height);
        this.addChild(this._text);
    }

    set score(val: number) {
        this._score = val;
        this._text.text = val.toString();
    }

    reset() {
        this.score = 0;
    }
}
