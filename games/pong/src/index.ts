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

// Define game constants here
const SCREEN_WIDTH = 128;
const SCREEN_HEIGHT = 64;
const HSCREEN_WIDTH = SCREEN_WIDTH / 2.0;
const HSCREEN_HEIGHT = SCREEN_HEIGHT / 2.0;
const PHYSICS_TIMESTEP = 0.01;
const HEADER_HEIGHT = 6;
const UI_SCREEN_WIDTH = SCREEN_WIDTH;
const UI_SCREEN_HEIGHT = SCREEN_HEIGHT + HEADER_HEIGHT * 2;
const BACKGROUND_COLOR = COLOR_LIGHT;
const HEADER_BACKGROUND_COLOR = COLOR_DARK;
const HEADER_TEXT_COLOR = COLOR_MEDIUM;
const BAR_COLOR = COLOR_MEDIUM;
const BAR_HEIGHT = 8;
const BAR_WIDTH = 4;
const BAR_SPEED = 0.75;
const BAR_X_OFFSET = 0.1;
const BAR_AI_THRESHOLD = 0.25;
const BALL_COLOR = COLOR_BG;
const BALL_SIZE = 2;
const BALL_ANGLES = [45, -45, 135, 225];
const BALL_SPEED = 1.0;
const BALL_ACCELERATION = 1.05;
const MAX_SCORE = 99;
const FONT_NAME = 'MoroboxAIRetro';
const FONT_PATH = 'assets/MoroboxAIRetro.fnt';

const AI_LEVELS = [
    { reaction: 0.2, error: 40 }, // 0:  ai is losing by 8
    { reaction: 0.3, error: 50 }, // 1:  ai is losing by 7
    { reaction: 0.4, error: 60 }, // 2:  ai is losing by 6
    { reaction: 0.5, error: 70 }, // 3:  ai is losing by 5
    { reaction: 0.6, error: 80 }, // 4:  ai is losing by 4
    { reaction: 0.7, error: 90 }, // 5:  ai is losing by 3
    { reaction: 0.8, error: 100 }, // 6:  ai is losing by 2
    { reaction: 0.9, error: 110 }, // 7:  ai is losing by 1
    { reaction: 1.0, error: 120 }, // 8:  tie
    { reaction: 1.1, error: 130 }, // 9:  ai is winning by 1
    { reaction: 1.2, error: 140 }, // 10: ai is winning by 2
    { reaction: 1.3, error: 150 }, // 11: ai is winning by 3
    { reaction: 1.4, error: 160 }, // 12: ai is winning by 4
    { reaction: 1.5, error: 170 }, // 13: ai is winning by 5
    { reaction: 1.6, error: 180 }, // 14: ai is winning by 6
    { reaction: 1.7, error: 190 }, // 15: ai is winning by 7
    { reaction: 1.8, error: 200 }  // 16: ai is winning by 8
];
const AI_LEVEL_MEDIUM = 8;

// Possible inputs for player and AIs
interface Inputs {
    up?: boolean;
    down?: boolean;
}

// Base class for the bars and the ball
abstract class Entity extends PIXI.Sprite {
    // Get the state of this entity as a JSON dict
    public abstract state: any;

    public get hwidth(): number {
        return this.width / 2.0;
    }

    public get hheight(): number {
        return this.height / 2.0;
    }

    public get left(): number {
        return this.x - this.hwidth;
    }

    public get right(): number {
        return this.x + this.hwidth;
    }

    public get top(): number {
        return this.y - this.hheight;
    }

    public get bottom(): number {
        return this.y + this.hheight;
    }

    constructor(width: number, height: number, tint: number) {
        super(PIXI.Texture.WHITE);

        this.width = width;
        this.height = height;
        this.tint = tint;
        this.anchor.set(0.5);
    }

    // Update the physics for this entity
    public abstract update(delta: number): void;
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
        super(width, height, tint);

        this._controller = controller;
    }

    // Update bar position and check collisions with screen bounds
    public update(delta: number) {
        const inputs: Inputs = this._controller.inputs();

        if (inputs.up) {
            this.position.y -= BAR_SPEED * delta;
        } else if (inputs.down) {
            this.position.y += BAR_SPEED * delta;
        }

        if (this.position.y < this.hheight) {
            this.position.y = this.hheight;
        } else if (this.position.y > SCREEN_HEIGHT - this.hheight) {
            this.position.y = SCREEN_HEIGHT - this.hheight;
        }
    }
}

// Class for the ball
class Ball extends Entity {
    public direction: PIXI.ObservablePoint = new PIXI.Point();
    public speed: number = 0;

    // Informations sent to AIs
    public get state(): any {
        return {
            x: this.x,
            y: this.y
        };
    }

    public get radius(): number {
        return this.hwidth;
    }

    constructor(size: number, tint: number) {
        super(size, size, tint);
    }

    // Update ball position and check collisions with screen bounds
    public update(delta: number) {
        this.position.x += this.direction.x * this.speed * delta;
        this.position.y += this.direction.y * this.speed * delta;

        if (this.position.y < this.hheight) {
            this.position.y = this.hheight;
            this.direction.y *= -1;
        } else if (this.position.y > SCREEN_HEIGHT - this.hheight) {
            this.position.y = SCREEN_HEIGHT - this.hheight;
            this.direction.y *= -1;
        }
    }
}

// Collision detection https://codeincomplete.com/articles/javascript-pong/part4/
function ballIntercept(ball: Ball, rect: any, nx: number, ny: number) {
    let pt;
    if (nx < 0) {
        pt = intercept(ball.x, ball.y, ball.x + nx, ball.y + ny,
            rect.right + ball.radius,
            rect.top - ball.radius,
            rect.right + ball.radius,
            rect.bottom + ball.radius,
            "right");
    } else if (nx > 0) {
        pt = intercept(ball.x, ball.y, ball.x + nx, ball.y + ny,
            rect.left - ball.radius,
            rect.top - ball.radius,
            rect.left - ball.radius,
            rect.bottom + ball.radius,
            "left");
    }
    if (!pt) {
        if (ny < 0) {
            pt = intercept(ball.x, ball.y, ball.x + nx, ball.y + ny,
                rect.left - ball.radius,
                rect.bottom + ball.radius,
                rect.right + ball.radius,
                rect.bottom + ball.radius,
                "bottom");
        }
        if (ny > 0) {
            pt = intercept(ball.x, ball.y, ball.x + nx, ball.y + ny,
                rect.left - ball.radius,
                rect.top - ball.radius,
                rect.right + ball.radius,
                rect.top - ball.radius,
                "top");
        }
    }

    return pt;
}

function intercept(x1: number, y1: number, x2: number, y2: number, x3: number, y3: number, x4: number, y4: number, d: string) {
    var denom = ((y4 - y3) * (x2 - x1)) - ((x4 - x3) * (y2 - y1));
    if (denom != 0) {
        var ua = (((x4 - x3) * (y1 - y3)) - ((y4 - y3) * (x1 - x3))) / denom;
        if ((ua >= 0) && (ua <= 1)) {
            var ub = (((x2 - x1) * (y1 - y3)) - ((y2 - y1) * (x1 - x3))) / denom;
            if ((ub >= 0) && (ub <= 1)) {
                var x = x1 + (ua * (x2 - x1));
                var y = y1 + (ua * (y2 - y1));
                return { x: x, y: y, d: d };
            }
        }
    }

    return null;
}

// Builtin AI controller that can be overriden by user AI
// From https://codeincomplete.com/articles/javascript-pong/part5/
class AIController implements MoroboxAIGameSDK.IController {
    // Controller provided by moroboxai-player-sdk
    private _controller: MoroboxAIGameSDK.IController;

    // Inputs of the builtin AI
    private _inputs: Inputs = {};

    // Predict where the ball will be
    private _prediction?: {
        dX: number;
        dY: number;
        y: number;
        since: number;
    };

    // AI level = difficulty
    private _level: number = AI_LEVEL_MEDIUM;

    get id(): number {
        return this._controller.id;
    }

    get isBound(): boolean {
        return this._controller.isBound;
    }

    get label(): string {
        return 'ai';
    }

    constructor(controller: MoroboxAIGameSDK.IController) {
        this._controller = controller;
    }

    sendState(state: any): void {
        this._controller.sendState(state);
    }

    inputs() {
        // override with user AI
        if (this._controller.isBound) {
            return this._controller.inputs;
        }

        return this._inputs;
    }

    private _predict(bar: Bar, ball: Ball, delta: number): number | undefined {
        if (this._prediction &&
            ((this._prediction.dX * ball.direction.x) > 0) &&
            ((this._prediction.dY * ball.direction.y) > 0) &&
            (this._prediction.since < AI_LEVELS[this._level].reaction)) {
            this._prediction.since += delta;
            return undefined;
        }

        const pt = ballIntercept(
            ball,
            {left: bar.left, right: bar.right, top: -10000, bottom: 10000},
            ball.direction.x * SCREEN_WIDTH,
            ball.direction.y * SCREEN_WIDTH
        );

        if (pt) {
            this._prediction = {
                dX: ball.direction.x,
                dY: ball.direction.y,
                y: pt.y,
                since: 0,
            }

            const closeness = (ball.direction.x < 0 ? ball.x - bar.right : bar.left - ball.x) / SCREEN_WIDTH;
            const error = AI_LEVELS[this._level].error * closeness;
            this._prediction.y = this._prediction.y + (((Math.random() * 2.0) - 1.0) * error);
        } else {
            this._prediction = undefined;
            return;
        }
    }

    update(bar: Bar, ball: Ball, delta: number) {
        this._inputs.up = false;
        this._inputs.down = false;

        if ((ball.x < bar.x && ball.direction.x < 0) ||
            (ball.x > bar.x && ball.direction.x > 0)) {
            return;
        }

        this._predict(bar, ball, delta);

        if (this._prediction) {
            if (this._prediction.y < bar.y - bar.height * BAR_AI_THRESHOLD) {
                this._inputs.up = true;
                this._inputs.down = false;
            } else if (this._prediction.y > bar.y + bar.height * BAR_AI_THRESHOLD) {
                this._inputs.up = false;
                this._inputs.down = true;
            }
        }
    }
}

// Header for displaying player and AIs infos
class PlayerPanel extends PIXI.Container {
    private _isLeft: boolean;
    private _controller?: MoroboxAIGameSDK.IController;
    private _controllerText?: PIXI.BitmapText;
    private _scoreText?: PIXI.BitmapText;
    private _score: number = 0;

    public set controller(value: MoroboxAIGameSDK.IController) {
        this._controller = value;
        this._update();
    }

    public get score(): number {
        return this._score;
    }

    public set score(value: number) {
        this._score = value;
        this._update();
    }

    constructor(isLeft: boolean) {
        super();

        this._isLeft = isLeft;
    }

    public onFontLoaded() {
        this._controllerText = new PIXI.BitmapText('', { fontName: FONT_NAME, align: 'left', tint: HEADER_TEXT_COLOR });
        this._controllerText.position.set(1, 1);
        this.addChild(this._controllerText);

        this._scoreText = new PIXI.BitmapText('', { fontName: FONT_NAME, align: 'left', tint: HEADER_TEXT_COLOR });
        this._scoreText.position.set(1, 1);
        this.addChild(this._scoreText);

        this._update();
    }

    private _update() {
        if (this._controllerText) {
            const value = this._controller ? this._controller.label.toUpperCase() : '';
            this._controllerText.text = this._isLeft ? `P1:${value}` : `${value}:P2`;
            this._controllerText.position.x = this._isLeft ? 1 : UI_SCREEN_WIDTH - this._controllerText.textWidth;
        }

        if (this._scoreText) {
            this._scoreText.text = this._score.toString();
            this._scoreText.position.x = (UI_SCREEN_WIDTH / 2.0) + (this._isLeft ? -this._scoreText.textWidth - 2 : 2);
        }
    }
}

class Header extends PIXI.Container {
    private _background: PIXI.Sprite;

    // Widgets displaying players infos
    private _playerPanels: PlayerPanel[];

    private _separatorText?: PIXI.BitmapText;

    public set p1(controller: MoroboxAIGameSDK.IController) {
        this._playerPanels[0].controller = controller;
    }

    public set p2(controller: MoroboxAIGameSDK.IController) {
        this._playerPanels[1].controller = controller;
    }

    public get p1Score(): number {
        return this._playerPanels[0].score;
    }

    public set p1Score(value: number) {
        this._playerPanels[0].score = value;
    }

    public get p2Score(): number {
        return this._playerPanels[1].score;
    }

    public set p2Score(value: number) {
        this._playerPanels[1].score = value;
    }

    constructor(width: number, height: number) {
        super();

        this._background = PIXI.Sprite.from(PIXI.Texture.WHITE);
        this._background.width = width;
        this._background.height = height;
        this._background.tint = HEADER_BACKGROUND_COLOR;
        this.addChild(this._background);

        this._playerPanels = [new PlayerPanel(true), new PlayerPanel(false)];
        this.addChild(...this._playerPanels);
    }

    public onFontLoaded() {
        this._playerPanels.forEach(_ => _.onFontLoaded());

        this._separatorText = new PIXI.BitmapText('-', { fontName: FONT_NAME, align: 'left', tint: HEADER_TEXT_COLOR });
        this._separatorText.position.set(UI_SCREEN_WIDTH / 2.0 - 2, 1);
        this.addChild(this._separatorText);
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
        this._background.tint = HEADER_BACKGROUND_COLOR;
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
        this.buffer = PIXI.RenderTexture.create({ width, height });
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
    private _physics_accumulator: number = 0;
    private _header: Header;
    private _footer: Footer;
    private _bars: { left: Bar, right: Bar };
    private _ball: Ball;
    private _playerController: MoroboxAIGameSDK.IController;
    private _aiController: AIController;

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
        this._playerController = player.controller(0)!;
        this._aiController = new AIController(player.controller(1)!);

        this._bars = {
            left: new Bar(this._playerController, BAR_WIDTH, BAR_HEIGHT, BAR_COLOR),
            right: new Bar(this._aiController, BAR_WIDTH, BAR_HEIGHT, BAR_COLOR)
        }

        this._ball = new Ball(BALL_SIZE, BALL_COLOR);

        this._gameBuffer.container.addChild(this._bars.left, this._bars.right, this._ball);

        // initialize the header
        this._header = new Header(UI_SCREEN_WIDTH, HEADER_HEIGHT);
        this._header.p1 = this._playerController;
        this._header.p2 = this._aiController;

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
        this._update_score(0, 0);

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

        const angle = (BALL_ANGLES[Math.floor(Math.random() * BALL_ANGLES.length)] * Math.PI) / 180.0;
        this._ball.direction.set(Math.cos(angle), Math.sin(angle));
        this._ball.speed = BALL_SPEED;
    }

    private _update_score(p1: number, p2: number) {
        this._header.p1Score = Math.min(p1, MAX_SCORE);
        this._header.p2Score = Math.min(p2, MAX_SCORE);
    }

    // https://codeincomplete.com/articles/javascript-pong/part4/
    private _checkCollision(bar: Bar, ball: Ball) {
        const pt = ballIntercept(ball, bar, ball.direction.x * ball.speed, ball.direction.y * ball.speed);
        if (!pt) {
            return;
        }

        switch(pt.d) {
            case 'left':
            case 'right':
                ball.x = pt.x;
                ball.direction.x *= -1;
                break;
            case 'top':
            case 'bottom':
                console.log(pt);
                ball.y = pt.y;
                ball.direction.y *= -1;
                break;
            default:
                break;
        }

        ball.speed *= BALL_ACCELERATION;
    }

    // Physics loop
    private _update(delta: number) {
        // tick the game elements
        this._aiController.update(this._bars.right, this._ball, delta);
        this._bars.left.update(delta);
        this._bars.right.update(delta);
        this._ball.update(delta);

        // check for collisions between ball and bars
        if (this._ball.direction.x < 0) {
            this._checkCollision(this._bars.left, this._ball);
        } else {
            this._checkCollision(this._bars.right, this._ball);
        }

        // check game over
        if (this._ball.position.x < 0 || this._ball.position.x > SCREEN_WIDTH) {
            if (this._ball.position.x < 0) {
                this._update_score(this._header.p1Score, this._header.p2Score + 1);
            } else {
                this._update_score(this._header.p1Score + 1, this._header.p2Score);
            }
            this._reset();
        }

        // send the new game state to AIs
        this._player.sendState(this._state);
    }

    // Render loop
    private _render() {
        this._gameBuffer.render(this._app.renderer);
        this._uiBuffer.render(this._app.renderer);
    }

    private _tick(delta: number) {
        this._physics_accumulator += delta;
        while (this._physics_accumulator > PHYSICS_TIMESTEP) {
            this._update(PHYSICS_TIMESTEP);
            this._physics_accumulator -= PHYSICS_TIMESTEP;
        }

        this._render();
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
