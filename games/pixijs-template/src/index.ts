import * as MoroboxAIGameSDK from 'moroboxai-game-sdk';
import * as PIXI from 'pixi.js';

class PixiJSTemplateGame implements MoroboxAIGameSDK.IGame
{
    private _app: PIXI.Application;

    constructor(options: MoroboxAIGameSDK.BootOptions) {
        // initialize PIXI application
        this._app = new PIXI.Application({
            width: 256,
            height: 256,
            view: options.root as HTMLCanvasElement,
            backgroundColor: 0x1099bb
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
