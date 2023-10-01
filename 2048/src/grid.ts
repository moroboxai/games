import Block from "./block";
import { Tile, Position } from "./utils";

export interface ITraversals {
    x: number[];
    y: number[];
}

export interface IGridStyle {
    backgroundTexture: PIXI.Texture;
    emptyTileTexture: PIXI.Texture;
    marginSize: number;
    separatorSize: number;
    tileSize: number;
}

export interface IGridOptions {
    size: number;
    style: IGridStyle;
}

export default class Grid extends PIXI.Container {
    private _style: IGridStyle;
    private _size: number;
    private _tiles: Block[][];

    constructor(options: IGridOptions) {
        super();
        this._style = options.style;
        this._size = options.size;

        // Create the background
        const background = new PIXI.Sprite(options.style.backgroundTexture);
        const gutterSize =
            options.style.marginSize * 2 +
            options.style.separatorSize * (options.size - 1);
        background.width = gutterSize + options.style.tileSize * options.size;
        background.height = background.width;
        this.addChild(background);

        // Create the tiles
        this._tiles = new Array<Array<Block | null>>();
        for (let i = 0; i < this._size; i++) {
            let row: Array<Block | null> = (this._tiles[i] = []);
            for (let j = 0; j < this._size; j++) {
                row.push(null);

                // Add a sprite for the tile
                const position = this.tilePosition({ i, j });
                const sprite = new PIXI.Sprite(options.style.emptyTileTexture);
                sprite.alpha = 0.25;
                sprite.anchor.set(0.5);
                sprite.position.set(position.x, position.y);
                this.addChild(sprite);
            }
        }
    }

    get size(): number {
        return this._size;
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

    tileContent(tile: Tile): Block {
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

    setBlock(tile: Tile, block: Block) {
        this._tiles[tile.i][tile.j] = block;
    }

    tilePosition(tile: Tile): Position {
        return {
            x:
                this._style.marginSize +
                (this._style.tileSize + this._style.separatorSize) * tile.i +
                this._style.tileSize / 2,
            y:
                this._style.marginSize +
                (this._style.tileSize + this._style.separatorSize) * tile.j +
                this._style.tileSize / 2
        };
    }

    findFarthestPosition(
        tile: Tile,
        vector: Position
    ): { farthest: Tile; next: Tile } {
        let previous!: Tile;

        // Progress towards the vector direction until an obstacle is found
        do {
            previous = tile;
            tile = { i: previous.i + vector.x, j: previous.j + vector.y };
        } while (this.withinBounds(tile) && this.tileAvailable(tile));

        return {
            farthest: previous,
            next: tile // Used to check if a merge is required
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

    saveState(): number[][] {
        return this._tiles.map((line) =>
            line.map((block) => (block !== null ? block.value : 0))
        );
    }
}
