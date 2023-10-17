/**
 * Sample of a Pong game for Moroxel8AI.
 */
import * as MoroboxAIGameSDK from "moroboxai-game-sdk";
import * as Moroxel8AI from "moroxel8ai";

// Colors from palette.png
const COLOR_BG = 0xcadc9f;
const COLOR_DARK = 0x0f380f;
const COLOR_MEDIUM = 0x306230;
const COLOR_LIGHT = 0x8bac0f;
const COLOR_LIGHTER = 0x9bbc0f;

// Define game constants here
const HEADER_HEIGHT = 8;
const HSWIDTH = SWIDTH / 2.0;
const HSHEIGHT = SHEIGHT / 2.0;
const TOP_GAME_Y = HEADER_HEIGHT;
const BOTTOM_GAME_Y = SHEIGHT - HEADER_HEIGHT;
const BAR_HEIGHT = 12;
const BAR_WIDTH = 4;
const BAR_SPEED = 1;
const BAR_X_OFFSET = 0.1;
const BAR_AI_THRESHOLD = 0.25;
const BALL_SIZE = 2;
const BALL_ANGLES = [45, -45, 135, 225];
const BALL_SPEED = 1.0;
const BALL_ACCELERATION = 1.05;
const MAX_SCORE = 99;
const TILEMAP = tmap("tilemap");
const FONT = fnt("MoroboxAIRetro");

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
    { reaction: 1.8, error: 200 }, // 16: ai is winning by 8
];
const AI_LEVEL_MEDIUM = 8;

interface Point {
    x: number;
    y: number;
}

interface Rectangle {
    left: number;
    right: number;
    top: number;
    bottom: number;
}

// Base class for the bars and the ball
class Entity {
    x: number;
    y: number;
    width: number;
    height: number;

    constructor(width: number, height: number) {
        this.x = 0;
        this.y = 0;
        this.width = width;
        this.height = height;
    }

    get hwidth() {
        return this.width / 2.0;
    }

    get hheight() {
        return this.height / 2.0;
    }

    get left() {
        return this.x - this.hwidth;
    }

    get right() {
        return this.x + this.hwidth;
    }

    get top() {
        return this.y - this.hheight;
    }

    get bottom() {
        return this.y + this.hheight;
    }

    // Get the state of this entity as a dict
    saveState(): any {
        throw new Error("state must be implemented");
    }

    // Load the state of this entity from a dict
    loadState(state: any) {
        throw new Error("state must be implemented");
    }

    // Update the physics
    update(deltaTime: number) {
        throw new Error("update must be implemented");
    }

    // Draw the sprite
    draw() {
        throw new Error("draw must be implemented");
    }
}

// Class for the player and AI bars
class Bar extends Entity {
    private _controller: PlayerController;

    constructor(controller: PlayerController, width: number, height: number) {
        super(width, height);

        this._controller = controller;
    }

    saveState(): Point {
        return {
            x: this.x,
            y: this.y,
        };
    }

    loadState(state: Point) {
        this.x = state.x;
        this.y = state.y;
    }

    // Update bar position and check collisions with screen bounds
    update(delta: number) {
        const inputs = this._controller.inputs();

        if (inputs.up) {
            this.y -= BAR_SPEED * delta;
        } else if (inputs.down) {
            this.y += BAR_SPEED * delta;
        }

        if (this.y < TOP_GAME_Y + this.hheight) {
            this.y = TOP_GAME_Y + this.hheight;
        } else if (this.y > BOTTOM_GAME_Y - this.hheight) {
            this.y = BOTTOM_GAME_Y - this.hheight;
        }
    }

    draw() {
        sclear();
        stile(TILEMAP, 0, 0, 1, 2);
        sorigin(4, 8);
        sdraw(this.x, this.y);
    }
}

// Class for the ball
class Ball extends Entity {
    direction: Point;
    speed: number;

    constructor(size: number) {
        super(size, size);

        this.direction = { x: 0, y: 0 };
        this.speed = 0;
    }

    saveState(): Point {
        return {
            x: this.x,
            y: this.y,
        };
    }

    loadState(state: Point) {
        this.x = state.x;
        this.y = state.y;
    }

    get radius() {
        return this.hwidth;
    }

    // Update ball position and check collisions with screen bounds
    update(delta: number) {
        this.x += this.direction.x * this.speed * delta;
        this.y += this.direction.y * this.speed * delta;

        if (this.y < TOP_GAME_Y + this.hheight) {
            this.y = TOP_GAME_Y + this.hheight;
            this.direction.y *= -1;
        } else if (this.y > BOTTOM_GAME_Y - this.hheight) {
            this.y = BOTTOM_GAME_Y - this.hheight;
            this.direction.y *= -1;
        }
    }

    draw() {
        sclear();
        stile(TILEMAP, 1, 0, 1, 1);
        sorigin(4, 4);
        sdraw(this.x, this.y);
    }
}

// Collision detection https://codeincomplete.com/articles/javascript-pong/part4/
function ballIntercept(ball: Ball, rect: Rectangle, nx: number, ny: number) {
    let pt;
    if (nx < 0) {
        pt = intercept(
            ball.x,
            ball.y,
            ball.x + nx,
            ball.y + ny,
            rect.right + ball.radius,
            rect.top - ball.radius,
            rect.right + ball.radius,
            rect.bottom + ball.radius,
            "right"
        );
    } else if (nx > 0) {
        pt = intercept(
            ball.x,
            ball.y,
            ball.x + nx,
            ball.y + ny,
            rect.left - ball.radius,
            rect.top - ball.radius,
            rect.left - ball.radius,
            rect.bottom + ball.radius,
            "left"
        );
    }
    if (!pt) {
        if (ny < 0) {
            pt = intercept(
                ball.x,
                ball.y,
                ball.x + nx,
                ball.y + ny,
                rect.left - ball.radius,
                rect.bottom + ball.radius,
                rect.right + ball.radius,
                rect.bottom + ball.radius,
                "bottom"
            );
        }
        if (ny > 0) {
            pt = intercept(
                ball.x,
                ball.y,
                ball.x + nx,
                ball.y + ny,
                rect.left - ball.radius,
                rect.top - ball.radius,
                rect.right + ball.radius,
                rect.top - ball.radius,
                "top"
            );
        }
    }

    return pt;
}

function intercept(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    x3: number,
    y3: number,
    x4: number,
    y4: number,
    d: string
) {
    var denom = (y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1);
    if (denom != 0) {
        var ua = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / denom;
        if (ua >= 0 && ua <= 1) {
            var ub = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / denom;
            if (ub >= 0 && ub <= 1) {
                var x = x1 + ua * (x2 - x1);
                var y = y1 + ua * (y2 - y1);
                return { x: x, y: y, d: d };
            }
        }
    }

    return null;
}

class PlayerController {
    private _pid: number;
    score: number;

    constructor(pid: number) {
        this._pid = pid;
        this.score = 0;
    }

    get pid() {
        return this._pid;
    }

    get label() {
        return "human";
    }

    sendState(val: any) {
        state(this._pid, val);
    }

    inputs() {
        return {
            left: btn(this._pid, BLEFT),
            right: btn(this._pid, BRIGHT),
            up: btn(this._pid, BUP),
            down: btn(this._pid, BDOWN),
        };
    }
}

// Builtin AI controller that can be overriden by user AI
// From https://codeincomplete.com/articles/javascript-pong/part5/
class AIController extends PlayerController {
    private _inputs: any;
    private _prediction: any;
    private _level: number;
    isBound: boolean;

    constructor(pid: number) {
        super(pid);
        // Inputs of the builtin AI
        this._inputs = {};
        this._prediction = undefined;
        // AI level = difficulty
        this._level = AI_LEVEL_MEDIUM;
    }

    get label() {
        return "ai";
    }

    sendState(val: any) {
        state(this.pid, val);
    }

    inputs() {
        // override with user AI
        if (this.isBound) {
            return super.inputs();
        }

        return this._inputs;
    }

    private _predict(bar: Bar, ball: Ball, delta: number): void {
        if (
            this._prediction &&
            this._prediction.dX * ball.direction.x > 0 &&
            this._prediction.dY * ball.direction.y > 0 &&
            this._prediction.since < AI_LEVELS[this._level].reaction
        ) {
            this._prediction.since += delta;
            return;
        }

        const pt = ballIntercept(
            ball,
            { left: bar.left, right: bar.right, top: -10000, bottom: 10000 },
            ball.direction.x * SWIDTH,
            ball.direction.y * SWIDTH
        );

        if (pt) {
            this._prediction = {
                dX: ball.direction.x,
                dY: ball.direction.y,
                y: pt.y,
                since: 0,
            };

            const closeness =
                (ball.direction.x < 0
                    ? ball.x - bar.right
                    : bar.left - ball.x) / SWIDTH;
            const error = AI_LEVELS[this._level].error * closeness;
            this._prediction.y =
                this._prediction.y + (Math.random() * 2.0 - 1.0) * error;
        } else {
            this._prediction = undefined;
            return;
        }
    }

    update(bar: Bar, ball: Ball, delta: number) {
        this._inputs.up = false;
        this._inputs.down = false;

        if (
            (ball.x < bar.x && ball.direction.x < 0) ||
            (ball.x > bar.x && ball.direction.x > 0)
        ) {
            return;
        }

        this._predict(bar, ball, delta);

        if (this._prediction) {
            if (this._prediction.y < bar.y - bar.height * BAR_AI_THRESHOLD) {
                this._inputs.up = true;
                this._inputs.down = false;
            } else if (
                this._prediction.y >
                bar.y + bar.height * BAR_AI_THRESHOLD
            ) {
                this._inputs.up = false;
                this._inputs.down = true;
            }
        }
    }
}

export enum EGameMode {
    PLAY,
    GAME_OVER,
}

const playerController = new PlayerController(P1);
const aiController = new AIController(P2);

const bars = {
    left: new Bar(playerController, BAR_WIDTH, BAR_HEIGHT),
    right: new Bar(aiController, BAR_WIDTH, BAR_HEIGHT),
};

const ball = new Ball(BALL_SIZE);

let mode: EGameMode = EGameMode.PLAY;

// Reset game to initial state
function reset() {
    mode = EGameMode.PLAY;

    bars.left.x = SWIDTH * BAR_X_OFFSET;
    bars.left.y = HSHEIGHT;
    bars.right.x = SWIDTH - SWIDTH * BAR_X_OFFSET;
    bars.right.y = HSHEIGHT;
    ball.x = HSWIDTH;
    ball.y = HSHEIGHT;

    const angle =
        (BALL_ANGLES[floor(Math.random() * BALL_ANGLES.length)] * Math.PI) /
        180.0;
    ball.direction.x = cos(angle);
    ball.direction.y = sin(angle);
    ball.speed = BALL_SPEED;
}

// https://codeincomplete.com/articles/javascript-pong/part4/
function checkCollision(bar: Bar, ball: Ball) {
    const pt = ballIntercept(
        ball,
        bar,
        ball.direction.x * ball.speed,
        ball.direction.y * ball.speed
    );
    if (!pt) {
        return;
    }

    switch (pt.d) {
        case "left":
        case "right":
            ball.x = pt.x;
            ball.direction.x *= -1;
            break;
        case "top":
        case "bottom":
            ball.y = pt.y;
            ball.direction.y *= -1;
            break;
        default:
            break;
    }

    ball.speed *= BALL_ACCELERATION;
}

function update(deltaTime: number) {
    // tick the game elements
    aiController.update(bars.right, ball, deltaTime);
    bars.left.update(deltaTime);
    bars.right.update(deltaTime);
    ball.update(deltaTime);

    // check for collisions between ball and bars
    if (ball.direction.x < 0) {
        checkCollision(bars.left, ball);
    } else {
        checkCollision(bars.right, ball);
    }

    // check game over
    if (ball.x < 0 || ball.x > SWIDTH) {
        if (ball.x < 0) {
            aiController.score = min(aiController.score + 1, MAX_SCORE);
        } else {
            playerController.score = min(playerController.score + 1, MAX_SCORE);
        }
        reset();
    }
}

function drawPlayerUI(controller: PlayerController) {
    const isLeft = controller.pid === P1;
    const label = controller.label.toUpperCase();

    falign(isLeft ? 0 : 1, 0);
    fdraw(
        FONT,
        isLeft ? `P1:${label}` : `${label}:P2`,
        isLeft ? 2 : SWIDTH - 1,
        2
    );

    falign(isLeft ? 1 : 0, 0);
    fdraw(FONT, controller.score.toString(), HSWIDTH + (isLeft ? -2 : 2), 2);
}

function draw() {
    clear(COLOR_LIGHT);
    camera(HSWIDTH, HSHEIGHT);

    // Draw game elements
    bars.left.draw();
    bars.right.draw();
    ball.draw();

    // Draw UI top and bottom backgrounds
    sclear();
    sscale(SWIDTH / 8, HEADER_HEIGHT / 8);
    stile(TILEMAP, 2, 1, 1, 1);
    sdraw(0, 0);
    sdraw(0, SHEIGHT - HEADER_HEIGHT);

    // Draw score separator
    fclear();
    fcolor(COLOR_MEDIUM);
    falign(0.5, 0);
    fdraw(FONT, "-", HSWIDTH, 2);

    // Draw players infos
    drawPlayerUI(playerController);
    drawPlayerUI(aiController);
}

reset();

export type GameSaveState = MoroboxAIGameSDK.GameSaveState & {
    // Game mode
    mode: EGameMode;
    // Both scores
    scores: number[];
    // Positions of the bars
    bars: Point[];
    // Position of the ball
    ball: Point;
};

export interface AgentGameState {
    // Positions of the bars
    bars: Point[];
    // Position of the ball
    ball: Point;
}

export function tick(deltaTime: number) {
    update(deltaTime);
    draw();
}

export function saveState(): GameSaveState {
    return {
        isGameOver: mode === EGameMode.GAME_OVER,
        mode,
        scores: [playerController.score, aiController.score],
        bars: [bars.left.saveState(), bars.right.saveState()],
        ball: ball.saveState(),
    };
}

export function loadState(state?: GameSaveState) {
    if (state === undefined) {
        reset();
        return;
    }

    mode = state.mode;
    playerController.score = state.scores[0];
    aiController.score = state.scores[1];
    bars.left.loadState(state.bars[0]);
    bars.right.loadState(state.bars[1]);
    ball.loadState(state.ball);
}

export function getStateForAgent(): AgentGameState {
    return {
        bars: [bars.left.saveState(), bars.right.saveState()],
        ball: ball.saveState(),
    };
}
