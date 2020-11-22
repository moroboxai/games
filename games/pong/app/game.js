"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.boot = exports.Game = void 0;
const MoroboxAIGameSDK = require("moroboxai-game-sdk");
const PIXI = require("pixi.js");
class Game extends MoroboxAIGameSDK.AbstractGame {
    constructor(options) {
        super();
        this._root = options.root;
        this._sdk = options.sdk;
        this._sdk.ready(() => this._loadAssets());
    }
    _loadAssets() {
        this._player = PIXI.Sprite.from(this._sdk.href('assets/tileset.png'));
        this._run();
    }
    _run() {
        this.dX = 0.0;
        this.dY = 0.0;
        const SCREEN_WIDTH = 512;
        const SCREEN_HEIGHT = 448;
        this.app = new PIXI.Application({
            width: SCREEN_WIDTH,
            height: SCREEN_HEIGHT,
            backgroundColor: 0x1099bb
        });
        this._root.appendChild(this.app.view);
        const dX = 0.0;
        const dY = 0.0;
        this._player.anchor.set(0.5);
        this._player.x = this.app.screen.width / 2;
        this._player.y = this.app.screen.height / 2;
        this.app.stage.addChild(this._player);
        this.app.ticker.add(delta => {
            this.frame(this);
            this._player.x += dX;
            this._player.y += dY;
        });
    }
    help() {
        return 'TowerDefense game\n' +
            'outputs:\n' +
            '- screen_size: {x: screen width, y: screen height}\n' +
            '- pos: {x: horizontal position, y: vertical position}\n' +
            '- dir: {x: horizontal direction, y: vertical direction}\n' +
            'inputs:\n' +
            '- horizontal: horizontal speed\n' +
            '- vertical: vertical speed';
    }
    play() {
        console.log('play');
    }
    pause() {
        console.log('pause');
    }
    stop() {
        console.log('stop');
    }
    output(key, val) {
        if (key === 'screen_size') {
            return {
                x: this.app.screen.width,
                y: this.app.screen.height
            };
        }
        else if (key === 'pos') {
            return {
                x: this._player.x,
                y: this._player.y
            };
        }
        else if (key === 'dir') {
            return {
                x: this.dX,
                y: this.dY
            };
        }
        return val;
    }
    input(key, val) {
        if (key === 'horizontal') {
            this.dX = val;
        }
        else if (key === 'vertical') {
            this.dY = val;
        }
    }
}
exports.Game = Game;
function boot(options) {
    const game = new Game(options);
}
exports.boot = boot;
//# sourceMappingURL=game.js.map