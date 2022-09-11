import * as MoroboxAIGameSDK from 'moroboxai-game-sdk';
import * as PIXI from 'pixi.js';

export class Game implements MoroboxAIGameSDK.IGame
{
    private app: PIXI.Application;
    private player: PIXI.Sprite;
    private dX: Number;
    private dY: Number;

    constructor() {
        this.dX = 0.0;
        this.dY = 0.0;

        const SCREEN_WIDTH = 512;
        const SCREEN_HEIGHT = 448;
        /*const io = require('socket.io')();
        io.on('connection', client => { console.log('connection'); });
        io.listen(6900);*/
        
        this.app = new PIXI.Application({
            width: SCREEN_WIDTH,
            height: SCREEN_HEIGHT,
            backgroundColor: 0x1099bb
        });
        document.body.appendChild(this.app.view);
        
        // create a new Sprite from an image path
        this.player = PIXI.Sprite.from('assets/tileset.png');
        let dX = 0.0;
        let dY = 0.0;
        
        // center the sprite's anchor point
        this.player.anchor.set(0.5);
        
        // move the sprite to the center of the screen
        this.player.x = this.app.screen.width / 2;
        this.player.y = this.app.screen.height / 2;
        
        this.app.stage.addChild(this.player);

        // listen for animate update
        this.app.ticker.add(delta => {
            // just for fun, let's rotate mr rabbit a little
            // delta is 1 if running at 100% performance
            // creates frame-independent transformation
            this.frame(this);
            this.player.x += dX;
            this.player.y += dY;
        });
    }

    help(): string {
        return 'TowerDefense game\n' +
        'outputs:\n' +
        '- screen_size: {x: screen width, y: screen height}\n' +
        '- pos: {x: horizontal position, y: vertical position}\n' +
        '- dir: {x: horizontal direction, y: vertical direction}\n' +
        'inputs:\n' +
        '- horizontal: horizontal speed\n' +
        '- vertical: vertical speed';
    }

    frame(game: MoroboxAIGameSDK.IGame): void {
    }

    play(): void {
    }

    pause(): void {
    }

    stop(): void {
    }

    output(key: string, val?: any): any {
        if (key === 'screen_size') {
            return {
                x: this.app.screen.width,
                y: this.app.screen.height
            };
        } else if (key === 'pos') {
            return {
                x: this.player.x,
                y: this.player.y
            };
        } else if (key === 'dir') {
            return {
                x: this.dX,
                y: this.dY
            };
        }

        return val;
    }

    input(key: string, val: any): void {
        if (key === 'horizontal') {
            this.dX = val;
        } else if (key === 'vertical') {
            this.dY = val;
        }
    }
}
