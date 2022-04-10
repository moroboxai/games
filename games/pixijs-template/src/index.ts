import * as MoroboxAIGameSDK from 'moroboxai-game-sdk';
import * as PIXI from 'pixi.js';

class PixiJSTemplateGame implements MoroboxAIGameSDK.IGame
{
    private _app: PIXI.Application;
    private _container = new PIXI.Container();

    constructor(options: MoroboxAIGameSDK.BootOptions) {
        // initialize PIXI application
        this._app = new PIXI.Application({
            width: 256,
            height: 256,
            backgroundColor: 0x1099bb
        });

        // attach PIXI view to DOM element
        options.root.appendChild(this._app.view);

        this._app.stage.addChild(this._container);

        // Create a new texture
        const texture = PIXI.Texture.from(options.gameServer.href('assets/bunny.png'));
        
        // Create a 5x5 grid of bunnies
        for (let i = 0; i < 25; i++) {
            const bunny = new PIXI.Sprite(texture);
            bunny.anchor.set(0.5);
            bunny.x = (i % 5) * 40;
            bunny.y = Math.floor(i / 5) * 40;
            this._container.addChild(bunny);
        }

        // Move container to the center
        this._container.x = this._app.screen.width / 2;
        this._container.y = this._app.screen.height / 2;
        
        // Center bunny sprite in local container coordinates
        this._container.pivot.x = this._container.width / 2;
        this._container.pivot.y = this._container.height / 2;

        // Listen for animate update
        this._app.ticker.add((delta: number) => {
            // rotate the container!
            // use delta to create frame-independent transform
            this._container.rotation -= 0.01 * delta;
        });
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

    play(): void
    {
        console.log('play');
    }

    pause(): void
    {
        console.log('pause');
    }

    stop(): void
    {
        console.log('stop');
    }
}

export function boot(options: MoroboxAIGameSDK.BootOptions): MoroboxAIGameSDK.IGame {
    return new PixiJSTemplateGame(options);
}
