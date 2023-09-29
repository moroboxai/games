import * as MoroboxAIGameSDK from "moroboxai-game-sdk";
import { IPixiMoroxel8AI } from "piximoroxel8ai";
import Grid, { IGridStyle } from "./grid";
import Header, { IHeaderStyle } from "./header";
import { EMode, EDirection } from "./utils";

// Instance of the VM
declare const vm: IPixiMoroxel8AI;

// Instance of pixi.js stage
declare const stage: PIXI.Container;

// Width and height of the grid (number of tiles)
const GRID_SIZE: number = 4;

// Number of tiles at the start
const START_TILES: number = 2;

// Size of the margins
const MARGIN_SIZE: number = 6;

// Height of the header
const HEADER_HEIGHT: number = 16 + MARGIN_SIZE;

// Default font
const FONT_NAME = "MoroboxAIRetro";

const HEADER_STYLE: IHeaderStyle = {
    backgroundTexture,
    fontName: FONT_NAME,
    fontSize: 16
};

const GRID_STYLE: IGridStyle = {
    backgroundTexture,
    emptyTileTexture,
    marginSize: 6,
    separatorSize: 4,
    tileSize: 26,
    blockStyle: {
        backgroundTexture,
        fontName: FONT_NAME,
        smallFontSize: 16,
        mediumFontSize: 12,
        largeFontSize: 8,
        xLargeFontSize: 6,
        xxLargeFontSize: 4,
        colors: Object.assign(
            {},
            ...[
                [2, 0, 0xffffff],
                [4, 0, 0xffffff],
                [8, 0, 0xffffff],
                [16, 0, 0xffffff],
                [32, 0, 0xffffff],
                [64, 0, 0xffffff],
                [128, 0, 0xffffff],
                [256, 0, 0xffffff],
                [512, 0, 0xffffff],
                [1024, 0, 0xffffff],
                [2048, 0, 0xffffff],
                [4096, 0, 0xffffff],
                [8192, 0, 0xffffff],
                [16384, 0, 0xffffff],
                [32768, 0, 0xffffff]
            ].map((options) => ({
                [options[0]]: {
                    color: options[1],
                    backgroundColor: options[2]
                }
            }))
        )
    }
};

var tileset: PIXI.Texture;
var headerBackgroundTexture: PIXI.Texture;
var backgroundTexture: PIXI.Texture;
var emptyTileTexture: PIXI.Texture;
var blockTexture: { [key: number]: PIXI.Texture };
var gameManager: GameManager;

export interface IGameState {
    mode: EMode;
    moveDirection: EDirection;
    grid: number[][];
}

class GameManager extends PIXI.Container {
    private header: Header;
    private grid: Grid;
    private mode: EMode;
    private moveDirection: EDirection;

    constructor() {
        super();
        this.header = new Header({
            width: vm.SWIDTH,
            height: HEADER_HEIGHT,
            style: HEADER_STYLE
        });
        this.grid = new Grid({
            size: GRID_SIZE,
            startTiles: START_TILES,
            style: GRID_STYLE
        });
        this.grid.position.set(0, this.header.height);
        this.addChild(this.header);
        this.addChild(this.grid);
        this.reset();
    }

    reset() {
        this.header.reset();
        this.grid.reset();
        this.mode = EMode.IDLE;
        this.moveDirection = EDirection.UP;
    }

    move(direction: EDirection) {
        if (this.mode === EMode.MOVE) {
            return;
        }

        this.mode = EMode.MOVE;
    }

    tick(delta: number) {
        this.grid.tick(delta);
    }

    loadState(state: IGameState) {
        this.mode = state.mode;
        this.moveDirection = state.moveDirection;
        this.grid.loadState(state.grid);
    }

    saveState(): IGameState {
        // Send the blocks to agent
        return {
            mode: this.mode,
            moveDirection: this.moveDirection,
            grid: this.grid.saveState()
        };
    }
}

/**
 * Loads the game and its assets.
 */
function load(): Promise<void> {
    console.log("load called");
    return new Promise<void>((resolve, reject) => {
        console.log("load assets");
        // use PIXI.Loader to load assets
        const loader = new PIXI.Loader();

        // load the font
        loader.add(vm.player.gameServer.href(`assets/MoroboxAIRetro.fnt`));

        // load the tileset
        loader.add("tileset", vm.player.gameServer.href(`assets/tileset.png`));

        // notify when done
        loader.onComplete.add(() => {
            console.log("assets loaded");

            // generate textures used by the game
            tileset = loader.resources.tileset.texture;
            headerBackgroundTexture = new PIXI.Texture(
                tileset.baseTexture,
                new PIXI.Rectangle(0, 0, 16, 16)
            );
            backgroundTexture = new PIXI.Texture(
                tileset.baseTexture,
                new PIXI.Rectangle(0, 0, 16, 16)
            );
            const tileSize = GRID_STYLE.tileSize;
            emptyTileTexture = new PIXI.Texture(
                tileset.baseTexture,
                new PIXI.Rectangle(19, 3, tileSize, tileSize)
            );
            blockTexture = {};
            for (let i = 0; i < 16; ++i) {
                blockTexture[Math.pow(2, i + 1)] = new PIXI.Texture(
                    tileset.baseTexture,
                    new PIXI.Rectangle(
                        51 + i * (tileSize + 6),
                        3,
                        tileSize,
                        tileSize
                    )
                );
            }

            // Create the manager instance
            gameManager = new GameManager();
            stage.addChild(gameManager);
            reset();

            resolve();
        });

        // start loading assets
        loader.load();
    });
}

/**
 * Resets the state of the game.
 */
function reset() {
    gameManager.reset();
}

/**
 * Ticks the game.
 * @param {number} delta - elapsed time
 */
function tick(inputs: Array<MoroboxAIGameSDK.IInputs>, delta: number) {
    if (inputs[0].left) {
        gameManager.move(EDirection.LEFT);
    } else if (inputs[0].right) {
        gameManager.move(EDirection.RIGHT);
    } else if (inputs[0].up) {
        gameManager.move(EDirection.UP);
    } else if (inputs[0].down) {
        gameManager.move(EDirection.DOWN);
    }

    gameManager.tick(delta);
}

function loadState(state: IGameState) {
    gameManager.loadState(state);
}

function saveState(): IGameState {
    return gameManager.saveState();
}

function getStateForAgent(): IGameState {
    return saveState();
}
