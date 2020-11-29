import * as MoroboxAIGameSDK from 'moroboxai-game-sdk';
import * as PIXI from 'pixi.js';

class PixiJSTemplateGame extends MoroboxAIGameSDK.AbstractGame
{
    private _app: PIXI.Application;

    constructor(options: MoroboxAIGameSDK.BootOptions) {
        super();

        // initialize PIXI application
        this._app = new PIXI.Application({
            width: 400,
            height: 300,
            backgroundColor: 0x1099bb
        });

        // attach PIXI view to DOM element
        options.root.appendChild(this._app.view);
    }

    public play(): void
    {
        console.log('play');
    }

    public pause(): void
    {
        console.log('pause');
    }

    public stop(): void
    {
        console.log('stop');
    }
}

export function boot(options: MoroboxAIGameSDK.BootOptions) {
    const game = new PixiJSTemplateGame(options);
}
