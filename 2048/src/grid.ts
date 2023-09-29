import Block, { IBlockStyle } from "./block";
import { Tile, Position } from "./utils";

export interface ITraversals {
    x: number[];
    y: number[];
}

export interface IGridStyle {
    backgroundTexture: PIXI.Texture;
    emptyTileTexture: PIXI.Texture;
    blockStyle: IBlockStyle;
    marginSize: number;
    separatorSize: number;
    tileSize: number;
}

export interface IGridOptions {
    size: number;
    startTiles: number;
    style: IGridStyle;
}

export default class Grid extends PIXI.Container {
    private _style: IGridStyle;
    private _size: number;
    private _startTiles: number;
    private _blockPool: Array<Block>;
    private _tiles: Block[][];

    constructor(options: IGridOptions) {
        super();
        this._style = options.style;
        this._size = options.size;
        this._startTiles = options.startTiles;

        // Create the background
        const background = new PIXI.Sprite(options.style.backgroundTexture);
        const gutterSize =
            options.style.marginSize * 2 +
            options.style.separatorSize * (options.size - 1);
        background.width = gutterSize + options.style.tileSize * options.size;
        background.height = background.width;
        this.addChild(background);

        // Create the tiles
        this._blockPool = new Array<Block>();
        this._tiles = new Array<Array<Block | null>>();
        for (let i = 0; i < this._size; i++) {
            let row: Array<Block | null> = (this._tiles[i] = []);
            for (let j = 0; j < this._size; j++) {
                // Add a block to the pool
                const tile = new Block({
                    size: options.style.tileSize,
                    style: options.style.blockStyle
                });
                this._blockPool.push(tile);
                row.push(null);

                // Add a sprite for the tile
                const position = this.tilePosition({ i, j });
                const sprite = new PIXI.Sprite(options.style.emptyTileTexture);
                sprite.alpha = 0.25;
                sprite.position.set(position.x, position.y);
                this.addChild(sprite);
            }
        }
    }

    reset() {
        this.clear();
        this.addStartBlocks();
    }

    clear() {
        for (let i = 0; i < this._size; ++i) {
            for (let j = 0; j < this._size; ++j) {
                this.removeBlock({ i, j });
            }
        }
    }

    eachTile(callback: (i: number, j: number, block: Block | null) => void) {
        for (var i = 0; i < this._size; i++) {
            for (var j = 0; j < this._size; j++) {
                callback(i, j, this._tiles[i][j]);
            }
        }
    }

    availableTiles(): Tile[] {
        let tiles: Tile[] = [];

        this.eachTile((i, j, tile) => {
            if (!tile) {
                tiles.push({ i, j });
            }
        });

        return tiles;
    }

    randomAvailableTile(): Tile | undefined {
        var tiles = this.availableTiles();
        if (tiles.length === 0) {
            return undefined;
        }

        return tiles[Math.floor(Math.random() * tiles.length)];
    }

    get tilesAvailable(): boolean {
        return this.availableTiles().length !== 0;
    }

    get movesAvailable(): boolean {
        return this.tilesAvailable || this.blockMatchesAvailable;
    }

    getVector(direction: number): Tile {
        // Vectors representing tile movement
        var map: { [key: number]: Tile } = {
            0: { i: 0, j: -1 }, // Up
            1: { i: 1, j: 0 }, // Right
            2: { i: 0, j: 1 }, // Down
            3: { i: -1, j: 0 } // Left
        };

        return map[direction];
    }

    get blockMatchesAvailable(): boolean {
        var block;

        for (var i = 0; i < this._size; i++) {
            for (var j = 0; j < this._size; j++) {
                block = this.tileContent({ i, j });

                if (block) {
                    for (var direction = 0; direction < 4; direction++) {
                        var vector = this.getVector(direction);
                        var tile = { i: i + vector.i, j: j + vector.j };

                        var other = this.tileContent(tile);

                        if (other && other.value === block.value) {
                            return true; // These two blocks can be merged
                        }
                    }
                }
            }
        }

        return false;
    }

    withinBounds(position: Tile): boolean {
        return (
            position.i >= 0 &&
            position.i < this._size &&
            position.j >= 0 &&
            position.j < this._size
        );
    }

    tileContent(tile: Tile): Block | null {
        if (this.withinBounds(tile)) {
            return this._tiles[tile.i][tile.j];
        } else {
            return null;
        }
    }

    tileOccupied(tile: Tile): boolean {
        return this.tileContent(tile) !== null;
    }

    tileAvailable(tile: Tile): boolean {
        return !this.tileOccupied(tile);
    }

    addStartBlocks() {
        for (let i = 0; i < this._startTiles; ++i) {
            this.addRandomBlock();
        }
    }

    addRandomBlock() {
        if (!this.tilesAvailable) {
            return;
        }

        var value = Math.random() < 0.9 ? 2 : 4;
        this.insertBlock(this.randomAvailableTile(), value);
    }

    insertBlock(tile: Tile, value: number) {
        const block = this._blockPool.pop();
        if (block !== undefined) {
            this.addChild(block);
            const position = this.tilePosition(tile);
            block.position.set(position.x, position.y);
            block.value = value;
            this._tiles[tile.i][tile.j] = block;
        }
    }

    removeBlock(tile: Tile) {
        if (this._tiles[tile.i][tile.j] !== null) {
            const block = this._tiles[tile.i][tile.j];
            this.removeChild(block);
            this._blockPool.push(block);
            this._tiles[tile.i][tile.j] = null;
        }
    }

    tilePosition(tile: Tile): Position {
        return {
            x:
                this._style.marginSize +
                (this._style.tileSize + this._style.separatorSize) * tile.i,
            y:
                this._style.marginSize +
                (this._style.tileSize + this._style.separatorSize) * tile.j
        };
    }

    buildTraversals(vector: Position): ITraversals {
        var traversals: ITraversals = { x: [], y: [] };

        for (var pos = 0; pos < this._size; pos++) {
            traversals.x.push(pos);
            traversals.y.push(pos);
        }

        // Always traverse from the farthest cell in the chosen direction
        if (vector.x === 1) traversals.x = traversals.x.reverse();
        if (vector.y === 1) traversals.y = traversals.y.reverse();

        return traversals;
    }

    loadState(state: number[][]) {
        this.clear();
        state.map((line, i) =>
            line.map((value, j) => {
                if (value !== 0) {
                    this.insertBlock({ i, j }, value);
                }
            })
        );
    }

    saveState(): number[][] {
        return this._tiles.map((line) =>
            line.map((block) => (block !== null ? block.value : 0))
        );
    }

    tick(delta: number) {
        this._blockPool.forEach((block) => {
            if (block.targetPosition === undefined) {
                return;
            }

            this.position.set(
                (block.targetPosition.x - this.position.x) * delta,
                (block.targetPosition.y - this.position.y) * delta
            );
        });
    }
}
