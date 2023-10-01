import * as MoroboxAIGameSDK from "moroboxai-game-sdk";
import { IPixiMoroxel8AI } from "piximoroxel8ai";
import Grid, { IGridStyle } from "./grid";
import Header, { IHeaderStyle } from "./header";
import { EDirection, getVector, Tile } from "./utils";
import Block, { EBlockMode, IBlockStyle } from "./block";
import { ITween, MergeBlockTween, MoveBlockTween } from "./tween";

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

const BLOCK_STYLE: IBlockStyle = {
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
};

const GRID_STYLE: IGridStyle = {
    backgroundTexture,
    emptyTileTexture,
    marginSize: 6,
    separatorSize: 4,
    tileSize: 26
};

var tileset: PIXI.Texture;
var backgroundTexture: PIXI.Texture;
var emptyTileTexture: PIXI.Texture;
var gameManager: GameManager;

enum EGameMode {
    PLAY = 0,
    GAME_OVER
}
export interface IGameState {
    mode: EGameMode;
    moveDirection: EDirection;
    grid: number[][];
}

class GameManager extends PIXI.Container {
    private header: Header;
    private grid: Grid;
    private _startTiles: number;
    private _blockPool: Block[] = [];
    private mode: EGameMode;
    private moveDirection: EDirection;
    private _tweens: ITween[] = [];

    constructor() {
        super();

        // Create the UI
        this.header = new Header({
            width: vm.SWIDTH,
            height: HEADER_HEIGHT,
            style: HEADER_STYLE
        });
        this.addChild(this.header);

        // Create the grid
        this.grid = new Grid({
            size: GRID_SIZE,
            style: GRID_STYLE
        });
        this.grid.position.set(0, this.header.height);
        this.grid.sortableChildren = true;
        this.addChild(this.grid);

        this._startTiles = START_TILES;

        // Create a pool of blocks
        const tile = new Block({
            size: GRID_STYLE.tileSize,
            style: BLOCK_STYLE
        });
        this._blockPool.push(tile);

        this.reset();
    }

    reset() {
        this.header.reset();
        this.clear();
        this.addStartBlocks();
        this.mode = EGameMode.PLAY;
        this.moveDirection = EDirection.UP;
    }

    clear() {
        for (let i = 0; i < this.grid.size; ++i) {
            for (let j = 0; j < this.grid.size; ++j) {
                this.removeBlock({ i, j });
            }
        }
    }

    acquireBlock(): Block {
        const block = this._blockPool.pop();
        if (block !== undefined) {
            return block;
        }

        return new Block({
            size: GRID_STYLE.tileSize,
            style: BLOCK_STYLE
        });
    }

    releaseBlock(block: Block) {
        this.grid.removeChild(block);
        this._blockPool.push(block);
    }

    addStartBlocks() {
        for (let i = 0; i < this._startTiles; ++i) {
            this.addRandomBlock();
        }
    }

    addRandomBlock() {
        if (this.grid.tilesAvailable) {
            this.insertBlock(
                this.grid.randomAvailableTile(),
                Math.random() < 0.9 ? 2 : 4
            );
        }
    }

    insertBlock(tile: Tile, value: number) {
        const position = this.grid.tilePosition(tile);
        const block = this.acquireBlock();
        block.mode = EBlockMode.IDLE;
        block.value = value;
        block.position.set(position.x, position.y);
        this.grid.addChild(block);
        this.grid.setBlock(tile, block);
    }

    removeBlock(tile: Tile) {
        const block = this.grid.tileContent(tile);
        if (block !== null) {
            this.grid.setBlock(tile, null);
            this.releaseBlock(block);
        }
    }

    moveBlock(from: Tile, to: Tile) {
        const block = this.grid.tileContent(from);
        if (block === null) {
            return;
        }

        block.zIndex = 0;

        // Clear the source tile
        this.grid.setBlock(from, null);

        // Move animation
        const moveTween = new MoveBlockTween(
            block,
            this.grid.tilePosition(to),
            0.25
        );
        moveTween.then(() => {
            block.mode = EBlockMode.IDLE;
        });
        this._tweens.push(moveTween);

        // Check if merge possible
        const destBlock = this.grid.tileContent(to);
        if (destBlock !== null) {
            destBlock.mode = EBlockMode.MERGE;
            destBlock.zIndex = 1;
            block.mode = EBlockMode.MOVE_AND_MERGE;

            // Merge animation
            const mergeTween = new MergeBlockTween(
                destBlock,
                destBlock.value * 2,
                0.1
            );
            mergeTween.then(() => {
                destBlock.mode = EBlockMode.IDLE;
            });
            this._tweens.push(mergeTween);

            // Remove the moving block after
            moveTween.then(() => {
                this.releaseBlock(block);
            });
        } else {
            // Set the destination tile
            this.grid.setBlock(to, block);
            block.mode = EBlockMode.MOVE;
        }
    }

    move(direction: EDirection) {
        if (this.mode !== EGameMode.PLAY || this._tweens.length > 0) {
            return;
        }

        let moved: boolean = false;
        const vector = getVector(direction);
        const traversals = this.grid.buildTraversals(vector);

        // Traverse the grid in the right direction and move tiles
        traversals.x.forEach((x) => {
            traversals.y.forEach((y) => {
                let tile = { i: x, j: y };
                let block = this.grid.tileContent(tile);
                if (block === null) {
                    return;
                }

                const currentPosition = {
                    x: block.position.x,
                    y: block.position.y
                };
                const positions = this.grid.findFarthestPosition(tile, vector);
                const next = this.grid.tileContent(positions.next);
                if (
                    next !== null &&
                    next !== block &&
                    next.mode !== EBlockMode.MOVE_AND_MERGE &&
                    next.mode !== EBlockMode.MERGE &&
                    next.value === block.value
                ) {
                    this.moveBlock(tile, positions.next);
                    moved = true;
                } else if (positions.farthest !== tile) {
                    this.moveBlock(tile, positions.farthest);
                    moved = true;
                }
            });
        });

        if (moved) {
            this.addRandomBlock();

            if (!this.grid.movesAvailable) {
                this.mode = EGameMode.GAME_OVER;
            }
        }
    }

    tick(delta: number) {
        for (let i = 0; i < this._tweens.length; ++i) {
            this._tweens[i].tick(delta);
            if (this._tweens[i].done) {
                this._tweens.splice(i, 1);
                --i;
            }
        }
    }

    loadState(state: IGameState) {
        this.mode = state.mode;
        this.moveDirection = state.moveDirection;
        this.clear();
        state.grid.map((line, i) =>
            line.map((value, j) => {
                if (value !== 0) {
                    this.insertBlock({ i, j }, value);
                }
            })
        );
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
export function load(): Promise<void> {
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
            HEADER_STYLE.backgroundTexture = new PIXI.Texture(
                tileset.baseTexture,
                new PIXI.Rectangle(0, 0, 16, 16)
            );
            GRID_STYLE.backgroundTexture = new PIXI.Texture(
                tileset.baseTexture,
                new PIXI.Rectangle(0, 0, 16, 16)
            );
            const tileSize = GRID_STYLE.tileSize;
            GRID_STYLE.emptyTileTexture = new PIXI.Texture(
                tileset.baseTexture,
                new PIXI.Rectangle(19, 3, tileSize, tileSize)
            );
            BLOCK_STYLE.backgroundTexture = new PIXI.Texture(
                tileset.baseTexture,
                new PIXI.Rectangle(19, 3, tileSize, tileSize)
            );

            // Create the manager instance
            gameManager = new GameManager();
            gameManager.reset();
            stage.addChild(gameManager);

            resolve();
        });

        // start loading assets
        loader.load();
    });
}

/**
 * Ticks the game.
 * @param {number} delta - elapsed time
 */
export function tick(inputs: Array<MoroboxAIGameSDK.IInputs>, delta: number) {
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

export function loadState(state: IGameState) {
    gameManager.loadState(state);
}

export function saveState(): IGameState {
    return gameManager.saveState();
}

export function getStateForAgent(): IGameState {
    return saveState();
}
