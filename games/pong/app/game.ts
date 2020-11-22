import * as MoroboxAIGameSDK from 'moroboxai-game-sdk';
import * as PIXI from 'pixi.js';

export class Game extends MoroboxAIGameSDK.AbstractGame
{
    private _root: HTMLElement;
    private _sdk: MoroboxAIGameSDK.IMoroboxAIGameSDK;
    private app: PIXI.Application;
    private _player: PIXI.Sprite = new PIXI.Sprite();
    private dX: number = 0;
    private dY: number = 0;

    constructor(options: MoroboxAIGameSDK.BootOptions) {
        super();
        this._root = options.root;
        this._sdk = options.sdk;

        this.app = new PIXI.Application({
            width: 400,
            height: 300,
            backgroundColor: 0x1099bb
        });
        this._root.appendChild(this.app.view);

        this._sdk.ready(() => this._loadAssets());
    }

    private _loadAssets(): void {
        this._player = PIXI.Sprite.from(this._sdk.href('assets/tileset.png'));
        this._run();
    }

    private _run(): void {
        this.dX = 0.0;
        this.dY = 0.0;

        const SCREEN_WIDTH = 512;
        const SCREEN_HEIGHT = 448;
        /*const io = require('socket.io')();
        io.on('connection', client => { console.log('connection'); });
        io.listen(6900);*/

        // create a new Sprite from an image path
        const dX = 0.0;
        const dY = 0.0;

        // center the sprite's anchor point
        this._player.anchor.set(0.5);

        // move the sprite to the center of the screen
        this._player.x = this.app.screen.width / 2;
        this._player.y = this.app.screen.height / 2;

        this.app.stage.addChild(this._player);

        // listen for animate update
        this.app.ticker.add(delta => {
            // just for fun, let's rotate mr rabbit a little
            // delta is 1 if running at 100% performance
            // creates frame-independent transformation
            this.frame(this);
            this._player.x += dX;
            this._player.y += dY;
        });
    }

    public help(): string {
        return 'TowerDefense game\n' +
        'outputs:\n' +
        '- screen_size: {x: screen width, y: screen height}\n' +
        '- pos: {x: horizontal position, y: vertical position}\n' +
        '- dir: {x: horizontal direction, y: vertical direction}\n' +
        'inputs:\n' +
        '- horizontal: horizontal speed\n' +
        '- vertical: vertical speed';
    }

    public play(): void {
        console.log('play');
    }

    public pause(): void {
        console.log('pause');
    }

    public stop(): void {
        console.log('stop');
    }

    public output(key: string, val?: any): any {
        if (key === 'screen_size') {
            return {
                x: this.app.screen.width,
                y: this.app.screen.height
            };
        } else if (key === 'pos') {
            return {
                x: this._player.x,
                y: this._player.y
            };
        } else if (key === 'dir') {
            return {
                x: this.dX,
                y: this.dY
            };
        }

        return val;
    }

    public input(key: string, val: any): void {
        if (key === 'horizontal') {
            this.dX = val;
        } else if (key === 'vertical') {
            this.dY = val;
        }
    }
}

export function boot(options: MoroboxAIGameSDK.BootOptions) {
    const game = new Game(options);
}
