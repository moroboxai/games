import * as MoroboxAIGameSDK from 'moroboxai-game-sdk';
import * as PIXI from 'pixi.js';

const COLOR_BG = 0xCADC9F;
const COLOR_DARK = 0x0F380F;
const COLOR_MEDIUM = 0x306230;
const COLOR_LIGHT = 0x8BAC0F;
const COLOR_LIGHTER = 0x9BBC0F;

const SCREEN_WIDTH = 128;
const SCREEN_HEIGHT = 64;
const HSCREEN_WIDTH = SCREEN_WIDTH / 2.0;
const HSCREEN_HEIGHT = SCREEN_HEIGHT / 2.0;
const HEADER_HEIGHT = 6;
const UI_SCREEN_WIDTH = SCREEN_WIDTH;
const UI_SCREEN_HEIGHT = SCREEN_HEIGHT + HEADER_HEIGHT * 2;
const BACKGROUND_COLOR = COLOR_LIGHT;
const HEADER_COLOR = COLOR_DARK;
const BAR_COLOR = COLOR_MEDIUM;
const BAR_HEIGHT = 8;
const BAR_WIDTH = 4;
const BAR_SPEED = 2;
const BAR_X_OFFSET = 0.1;
const BALL_COLOR = COLOR_BG;
const BALL_SIZE = 2;

// Possible inputs for AIs
interface Inputs {
    up: boolean;
    down: boolean;
}

abstract class Entity {
    public sprite: PIXI.Sprite;

    public abstract state: any;

    public get position(): PIXI.ObservablePoint {
        return this.sprite.position;
    }

    constructor() {
        this.sprite = PIXI.Sprite.from(PIXI.Texture.WHITE);
    }

    public abstract tick(delta: number): void;
}

class Bar extends Entity {
    // Controller id
    public _id: number;
    // AI inputs
    public _inputs: Inputs = { up: false, down: false };

    public get id(): number {
        return this._id;
    }

    public get inputs(): Inputs {
        return this._inputs;
    }

    public set inputs(value: any) {
        this._inputs.up = value.up === true;
        this._inputs.down = value.down === true;
    }

    public get state(): any {
        return {
            id: this._id,
            x: this.sprite.x,
            y: this.sprite.y
        };
    }

    constructor(id: number, width: number, height: number, tint: number) {
        super();
        this._id = id;
        this.sprite.width = width;
        this.sprite.height = height;
        this.sprite.tint = tint;
        this.sprite.anchor.set(0.5);
    }

    public tick(delta: number) {
        if (this.inputs.up) {
            this.position.y -= BAR_SPEED * delta;
        } else if (this.inputs.down) {
            this.position.y += BAR_SPEED * delta;
        }

        if (this.position.y < 0) {
            this.position.y = 0;
        } else if (this.position.y > SCREEN_HEIGHT) {
            this.position.y = SCREEN_HEIGHT;
        }
    }
}

class Ball extends Entity {
    public velocity: PIXI.ObservablePoint = new PIXI.Point();

    public get state(): any {
        return {
            x: this.sprite.x,
            y: this.sprite.y
        };
    }

    constructor(size: number, tint: number) {
        super();
        this.sprite.width = size;
        this.sprite.height = size;
        this.sprite.tint = tint;
        this.sprite.anchor.set(0.5);
    }

    public tick(delta: number) {
        this.position.x += this.velocity.x * delta;
        this.position.y += this.velocity.y * delta;

        if (this.position.y < 0) {
            this.position.y = 0;
            this.velocity.y *= -1;
        } else if (this.position.y > SCREEN_HEIGHT) {
            this.position.y = SCREEN_HEIGHT;
            this.velocity.y *= -1;
        }
    }
}

// Header for displaying players infos
class Header extends PIXI.Container {
    private _sprite: PIXI.Sprite;
    private _p1Text?: PIXI.BitmapText;
    private _p2Text?: PIXI.BitmapText;

    constructor(width: number, height: number) {
        super();
        this._sprite = PIXI.Sprite.from(PIXI.Texture.WHITE);
        this._sprite.width = width;
        this._sprite.height = height;
        this._sprite.tint = HEADER_COLOR;
        this.addChild(this._sprite); 
    }

    public onFontLoaded() {
        this._p1Text = new PIXI.BitmapText('', {fontName: 'MoroboxAIRetro', align: 'left', tint: BAR_COLOR});
        this._p1Text.position.set(1, 1);
        this.addChild(this._p1Text);
        
        this._p2Text = new PIXI.BitmapText('', {fontName: 'MoroboxAIRetro', align: 'left', tint: BAR_COLOR});
        this._p2Text.position.set(1, 1);
        this.addChild(this._p2Text);

        this.updateP1('HUMAN');
        this.updateP2('AI');
    }

    public updateP1(value: string) {
        if (this._p1Text !== undefined) {
            this._p1Text.text = `P1:${value}`;
        }
    }

    public updateP2(value: string) {
        if (this._p2Text !== undefined) {
            this._p2Text.text = `${value}:P2`;
            this._p2Text.position.x = this._sprite.width - this._p2Text.textWidth;
        }
    }
}

// Footer for displaying additional infos
class Footer extends PIXI.Container {
    private _sprite: PIXI.Sprite;

    constructor(width: number, height: number) {
        super();
        this._sprite = PIXI.Sprite.from(PIXI.Texture.WHITE);
        this._sprite.width = width;
        this._sprite.height = height;
        this._sprite.tint = HEADER_COLOR;
        this.addChild(this._sprite); 
    }
}

class BackBuffer {
    public container: PIXI.Container;
    public buffer: PIXI.RenderTexture;
    public sprite: PIXI.Sprite;

    constructor(width: number, height: number) {
        this.container = new PIXI.Container();
        this.buffer = PIXI.RenderTexture.create({width, height});
        this.sprite = new PIXI.Sprite(this.buffer);
        this.sprite.pivot.set(0, 0);
        this.sprite.position.set(0, 0);
    }

    public render(renderer: PIXI.Renderer) {
        renderer.render(this.container, this.buffer);
    }
}

class PongGame implements MoroboxAIGameSDK.IGame {
    private _app: PIXI.Application;
    private _player: MoroboxAIGameSDK.IPlayer;
    private _uiBuffer: BackBuffer;
    private _gameBuffer: BackBuffer;
    private _header: Header;
    private _footer: Footer;
    private _bars!: { left: Bar, right: Bar };
    private _ball!: Ball;

    /**
     * Get the game state sent to AIs.
     * 
     * Format:
     * 
     *   {
     *     bars: [
     *       {id: number, x: number, y: number},
     *       ...
     *     ],
     *     ball: {x: number, y: number}
     *   }
     */
    private get _state(): any {
        return {
            bars: [
                this._bars.left.state,
                this._bars.right.state
            ],
            ball: this._ball.state
        };
    }

    constructor(player: MoroboxAIGameSDK.IPlayer) {
        this._player = player;

        // initialize PIXI application
        this._app = new PIXI.Application({
            width: UI_SCREEN_WIDTH,
            height: UI_SCREEN_HEIGHT,
            backgroundColor: BACKGROUND_COLOR,
            resolution: window.devicePixelRatio || 1
        });

        PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;

        // attach PIXI view to DOM element
        player.root.appendChild(this._app.view);

        // buffer for rendering game elements
        this._gameBuffer = new BackBuffer(SCREEN_WIDTH, SCREEN_HEIGHT);
        this._gameBuffer.sprite.position.set(0, HEADER_HEIGHT);

        // buffer for rendering game + extra UI
        this._uiBuffer = new BackBuffer(UI_SCREEN_WIDTH, UI_SCREEN_HEIGHT);
        this._uiBuffer.container.addChild(this._gameBuffer.sprite);

        this._app.stage.addChild(this._uiBuffer.sprite);

        window.addEventListener('resize', () => this._resize(), false);
        this._resize();

        // create procedural sprites for bars and ball
        this._bars = {
            left: new Bar(0, BAR_WIDTH, BAR_HEIGHT, BAR_COLOR),
            right: new Bar(1, BAR_WIDTH, BAR_HEIGHT, BAR_COLOR)
        }

        this._ball = new Ball(BALL_SIZE, BALL_COLOR);

        this._gameBuffer.container.addChild(this._bars.left.sprite, this._bars.right.sprite, this._ball.sprite);

        this._header = new Header(UI_SCREEN_WIDTH, HEADER_HEIGHT);
        this._uiBuffer.container.addChild(this._header);

        this._footer = new Footer(UI_SCREEN_WIDTH, HEADER_HEIGHT);
        this._footer.position.set(0, UI_SCREEN_HEIGHT - HEADER_HEIGHT);
        this._uiBuffer.container.addChild(this._footer);

        const loader = new PIXI.Loader();
        loader.add(this._player.gameServer.href('assets/MoroboxAIRetro.fnt'))
            .load((loader, resources) => {
                this._header.onFontLoaded();
            });

        // reset the game state
        this._reset();

        // register the tick function
        this._app.ticker.add((delta: number) => this._tick(delta));

        // notify the SDK we are ready
        player.ready();
    }

    // Scale the game view according to parent div
    private _resize() {
        const realWidth = this._player.root.clientWidth;
        const realHeight = this._player.root.clientHeight;

        this._app.renderer.resize(realWidth, realHeight);
        this._uiBuffer.sprite.scale.set(realWidth / UI_SCREEN_WIDTH, realHeight / UI_SCREEN_HEIGHT);
    }

    // Reset game to initial state
    private _reset() {
        this._bars.left.position.set(SCREEN_WIDTH * BAR_X_OFFSET, HSCREEN_HEIGHT);
        this._bars.right.position.set(SCREEN_WIDTH - SCREEN_WIDTH * BAR_X_OFFSET, HSCREEN_HEIGHT);
        this._ball.position.set(HSCREEN_WIDTH, HSCREEN_HEIGHT);
        this._ball.velocity.set((Math.random() * 2 - 1), (Math.random() * 2 - 1));
    }

    private _tick(delta: number) {
        // fetch inputs for both AIs
        const inputs = this._player.input();
        this._bars.left.inputs = inputs[0];
        this._bars.right.inputs = inputs[1];

        this._bars.left.tick(delta);
        this._bars.right.tick(delta);
        this._ball.tick(delta);

        if (this._ball.position.x < 0 || this._ball.position.x > SCREEN_WIDTH) {
            this._reset();
        }

        // send the new game state to AIs
        this._player.sendState(this._state);

        // render back buffers
        this._gameBuffer.render(this._app.renderer);
        this._uiBuffer.render(this._app.renderer);
    }

    help(): string {
        throw new Error('Method not implemented.');
    }
    output(key: string, val?: any) {
        throw new Error('Method not implemented.');
    }
    input(key: string, val: any): void {
        throw new Error('Method not implemented.');
    }

    frame(game: MoroboxAIGameSDK.IGame): void {
    }

    play(): void {
        console.log('play');
    }

    pause(): void {
        console.log('pause');
    }

    stop(): void {
        console.log('stop');
    }
}

export function boot(player: MoroboxAIGameSDK.IPlayer): MoroboxAIGameSDK.IGame {
    return new PongGame(player);
}
