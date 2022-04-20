/**
 * Sample of a Pong game with PixiJS made for MoroboxAI.
 * 
 * It should be fairly easy to read and understand as I tried
 * to separate the different elements correctly and avoid having
 * too many interconnections.
 */
import * as MoroboxAIGameSDK from 'moroboxai-game-sdk';
import * as PIXI from 'pixi.js';

// Color palette of the GB
const COLOR_BG = 0xCADC9F;
const COLOR_DARK = 0x0F380F;
const COLOR_MEDIUM = 0x306230;
const COLOR_LIGHT = 0x8BAC0F;
const COLOR_LIGHTER = 0x9BBC0F;

// Define the maximum constants here
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
const FONT_NAME = 'MoroboxAIRetro';
const FONT_PATH = 'assets/MoroboxAIRetro.fnt';

// Possible inputs for player and AIs
interface Inputs {
    up?: boolean;
    down?: boolean;
}

// Base class for the bars and the ball
abstract class Entity extends PIXI.Sprite {
    // Get the state of this entity as a JSON dict
    public abstract state: any;

    constructor() {
        super(PIXI.Texture.WHITE);
    }

    // Update the physics for this entity
    public abstract tick(delta: number): void;
}

// Class for the player and AI bars
class Bar extends Entity {
    // Controller instance
    public _controller: MoroboxAIGameSDK.IController;

    // Informations sent to AIs
    public get state(): any {
        return {
            id: this._controller.id,
            x: this.x,
            y: this.y
        };
    }

    constructor(controller: MoroboxAIGameSDK.IController, width: number, height: number, tint: number) {
        super();

        this._controller = controller;
        this.width = width;
        this.height = height;
        this.tint = tint;
        this.anchor.set(0.5);
    }

    public tick(delta: number) {
        const inputs: Inputs = this._controller.inputs();

        if (inputs.up) {
            this.position.y -= BAR_SPEED * delta;
        } else if (inputs.down) {
            this.position.y += BAR_SPEED * delta;
        }

        if (this.position.y < 0) {
            this.position.y = 0;
        } else if (this.position.y > SCREEN_HEIGHT) {
            this.position.y = SCREEN_HEIGHT;
        }
    }
}

// Class for the ball
class Ball extends Entity {
    public velocity: PIXI.ObservablePoint = new PIXI.Point();

    // Informations sent to AIs
    public get state(): any {
        return {
            x: this.x,
            y: this.y
        };
    }

    constructor(size: number, tint: number) {
        super();

        this.width = size;
        this.height = size;
        this.tint = tint;
        this.anchor.set(0.5);
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

// Header for displaying player and AIs infos
class Header extends PIXI.Container {
    private _background: PIXI.Sprite;

    // Text displayed for player 1 (left side)
    private _p1Text?: PIXI.BitmapText;

    // Text displayed for player 2 (right side)
    private _p2Text?: PIXI.BitmapText;

    constructor(width: number, height: number) {
        super();

        this._background = PIXI.Sprite.from(PIXI.Texture.WHITE);
        this._background.width = width;
        this._background.height = height;
        this._background.tint = HEADER_COLOR;
        this.addChild(this._background); 
    }

    public onFontLoaded() {
        this._p1Text = new PIXI.BitmapText('', {fontName: FONT_NAME, align: 'left', tint: BAR_COLOR});
        this._p1Text.position.set(1, 1);
        this.addChild(this._p1Text);
        
        this._p2Text = new PIXI.BitmapText('', {fontName: FONT_NAME, align: 'left', tint: BAR_COLOR});
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
            this._p2Text.position.x = this._background.width - this._p2Text.textWidth;
        }
    }
}

// Footer for displaying additional infos
class Footer extends PIXI.Container {
    private _background: PIXI.Sprite;

    constructor(width: number, height: number) {
        super();

        this._background = PIXI.Sprite.from(PIXI.Texture.WHITE);
        this._background.width = width;
        this._background.height = height;
        this._background.tint = HEADER_COLOR;
        this.addChild(this._background); 
    }
}

// RenderTexture used to render the game offscreen
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

// The game itself
class PongGame implements MoroboxAIGameSDK.IGame {
    private _app: PIXI.Application;

    // The player provided by moroboxai-player-sdk
    private _player: MoroboxAIGameSDK.IPlayer;

    // Buffer where the game will be rendered
    private _gameBuffer: BackBuffer;

    // Buffer where the game + extra UI will be rendered
    private _uiBuffer: BackBuffer;

    // Different elements of the game and UI
    private _header: Header;
    private _footer: Footer;
    private _bars: { left: Bar, right: Bar };
    private _ball: Ball;

    /**
     * Informations sent to AIs:
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
            backgroundColor: BACKGROUND_COLOR,
            resolution: window.devicePixelRatio || 1
        });

        PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;

        // attach PIXI view to root HTML element
        player.root.appendChild(this._app.view);

        // force resizing the root HTML element to game size
        player.resize(UI_SCREEN_WIDTH * 4, UI_SCREEN_HEIGHT * 4);

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
            left: new Bar(player.controller(0)!, BAR_WIDTH, BAR_HEIGHT, BAR_COLOR),
            right: new Bar(player.controller(1)!, BAR_WIDTH, BAR_HEIGHT, BAR_COLOR)
        }

        this._ball = new Ball(BALL_SIZE, BALL_COLOR);

        this._gameBuffer.container.addChild(this._bars.left, this._bars.right, this._ball);

        this._header = new Header(UI_SCREEN_WIDTH, HEADER_HEIGHT);
        this._uiBuffer.container.addChild(this._header);

        this._footer = new Footer(UI_SCREEN_WIDTH, HEADER_HEIGHT);
        this._footer.position.set(0, UI_SCREEN_HEIGHT - HEADER_HEIGHT);
        this._uiBuffer.container.addChild(this._footer);

        const loader = new PIXI.Loader();
        loader.add(this._player.gameServer.href(FONT_PATH))
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

// Boot function exported for moroboxai-player-sdk
export function boot(player: MoroboxAIGameSDK.IPlayer): MoroboxAIGameSDK.IGame {
    return new PongGame(player);
}
