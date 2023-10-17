import * as MoroboxAIGameSDK from "moroboxai-game-sdk";
import type { Controller } from "moroboxai-game-sdk";
import Grid, { IGridStyle } from "./grid";
import Header, { IHeaderStyle } from "./header";
import { EDirection, getVector, Tile } from "./utils";
import Block, { EBlockMode, IBlockStyle } from "./block";
import { ITween, MergeBlockTween, MoveBlockTween } from "./tween";

// Activate debug mode
const DEBUG: boolean = false;

// Width and height of the grid (number of tiles)
const GRID_SIZE: number = 4;

// Number of tiles at the start
const START_TILES: number = 2;

// Size of the margins
const MARGIN_SIZE: number = 6;

// Height of the header
const HEADER_HEIGHT: number = 16 + MARGIN_SIZE;

const HEADER_STYLE: IHeaderStyle = {
    backgroundTexture,
    fontName: "2048Big",
    fontSize: 14
};

const BLOCK_STYLE: IBlockStyle = {
    backgroundTexture,
    smallFontName: "2048Big",
    smallFontSize: 14,
    mediumFontName: "2048Small",
    mediumFontSize: 10,
    largeFontName: "2048Big",
    largeFontSize: 7,
    xLargeFontName: "2048Small",
    xLargeFontSize: 5,
    xxLargeFontName: "2048Small",
    xxLargeFontSize: 5,
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
                textColor: options[1],
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
export type GameSaveState = MoroboxAIGameSDK.GameSaveState & {
    mode: EGameMode;
    score: number;
    grid: number[][];
    moveDirection: EDirection;
};

export interface AgentGameState {
    score: number;
    grid: number[][];
}

class GameManager extends vm.PIXI.Container {
    private header: Header;
    private grid: Grid;
    private _startTiles: number;
    private _blockPool: Block[] = [];
    private mode: EGameMode;
    private moveDirection: EDirection;
    private _tweens: ITween[] = [];
    private _score: number;

    constructor() {
        super();

        // Create the UI
        this.header = new Header({
            width: vm.width,
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

    get score(): number {
        return this._score;
    }

    set score(value: number) {
        this._score = value;
        this.header.score = value;
    }

    reset() {
        this.header.reset();
        this.clear();
        this.addStartBlocks();
        this.mode = EGameMode.PLAY;
        this.moveDirection = EDirection.UP;
        this.score = 0;
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

    addDebugBlocks() {
        let value = 2;
        for (let i = 0; i < this.grid.size; ++i) {
            for (let j = 0; j < this.grid.size; ++j) {
                this.insertBlock({ i, j }, value);
                value *= 2;
                if (value > 32768) {
                    return;
                }
            }
        }
    }

    addStartBlocks() {
        if (DEBUG) {
            this.addDebugBlocks();
            return;
        }

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

    moveBlock(from: Tile, to: Tile): number | undefined {
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
            const newValue = destBlock.value * 2;
            const mergeTween = new MergeBlockTween(destBlock, newValue, 0.1);
            mergeTween.then(() => {
                destBlock.mode = EBlockMode.IDLE;
            });
            this._tweens.push(mergeTween);

            // Remove the moving block after
            moveTween.then(() => {
                this.releaseBlock(block);
            });

            // Update score
            this.score += newValue;
            return newValue;
        } else {
            // Set the destination tile
            this.grid.setBlock(to, block);
            block.mode = EBlockMode.MOVE;
            return undefined;
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

                const positions = this.grid.findFarthestPosition(tile, vector);
                const next = this.grid.tileContent(positions.next);
                let mergeValue: number | undefined = undefined;

                if (
                    next !== null &&
                    next !== block &&
                    next.mode !== EBlockMode.MOVE_AND_MERGE &&
                    next.mode !== EBlockMode.MERGE &&
                    next.value === block.value
                ) {
                    mergeValue = this.moveBlock(tile, positions.next);
                    moved = true;
                } else if (positions.farthest !== tile) {
                    mergeValue = this.moveBlock(tile, positions.farthest);
                    moved = true;
                }

                if (mergeValue === 2048) {
                    this.win();
                }
            });
        });

        if (moved) {
            this.addRandomBlock();

            if (!this.grid.movesAvailable) {
                this.gameOver();
            }
        }
    }

    win() {
        this.gameOver();
    }

    gameOver() {
        this.mode = EGameMode.GAME_OVER;
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

    loadState(state?: GameSaveState) {
        if (state === undefined) {
            this.reset();
            return;
        }

        this.mode = state.mode;
        this.score = state.score;
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

    saveState(): GameSaveState {
        // Send the blocks to agent
        return {
            isGameOver: this.mode === EGameMode.GAME_OVER,
            mode: this.mode,
            score: this.score,
            grid: this.grid.saveState(),
            moveDirection: this.moveDirection
        };
    }
}

/**
 * Loads the game and its assets.
 */
export function load(): Promise<void> {
    console.log("load called");
    return new Promise<void>(async (resolve) => {
        console.log("load assets");
        // load the fonts
        const loader = new vm.PIXI.Loader();

        loader.add(vm.gameServer.href(`assets/MoroboxAIRetro.fnt`));
        loader.add(vm.gameServer.href(`assets/2048Small.fnt`));
        loader.add(vm.gameServer.href(`assets/2048Big.fnt`));

        // load the tileset
        loader.add("tileset", vm.gameServer.href(`assets/tileset.png`));

        loader.onComplete.add(() => {
            console.log("assets loaded");

            const tileset = loader.resources.tileset.texture;

            // generate textures used by the game
            HEADER_STYLE.backgroundTexture = new vm.PIXI.Texture(
                tileset.baseTexture,
                new vm.PIXI.Rectangle(0, 0, 16, 16)
            );
            GRID_STYLE.backgroundTexture = new vm.PIXI.Texture(
                tileset.baseTexture,
                new vm.PIXI.Rectangle(0, 0, 16, 16)
            );
            const tileSize = GRID_STYLE.tileSize;
            GRID_STYLE.emptyTileTexture = new vm.PIXI.Texture(
                tileset.baseTexture,
                new vm.PIXI.Rectangle(19, 3, tileSize, tileSize)
            );
            BLOCK_STYLE.backgroundTexture = new vm.PIXI.Texture(
                tileset.baseTexture,
                new vm.PIXI.Rectangle(51, 3, tileSize, tileSize)
            );

            // Create the manager instance
            gameManager = new GameManager();
            gameManager.reset();
            vm.stage.addChild(gameManager);

            resolve();
        });

        loader.load();
    });
}

/**
 * Ticks the game.
 * @param {number} delta - elapsed time
 */
export function tick(controllers: Controller[], delta: number) {
    const inputs = controllers[0].inputs;

    if (inputs.left) {
        gameManager.move(EDirection.LEFT);
    } else if (inputs.right) {
        gameManager.move(EDirection.RIGHT);
    } else if (inputs.up) {
        gameManager.move(EDirection.UP);
    } else if (inputs.down) {
        gameManager.move(EDirection.DOWN);
    }

    gameManager.tick(delta);
}

export function loadState(state?: GameSaveState) {
    gameManager.loadState(state);
}

export function saveState(): GameSaveState {
    return gameManager.saveState();
}

export function getStateForAgent(): AgentGameState {
    const state = saveState();
    return {
        score: state.score,
        grid: state.grid
    };
}
