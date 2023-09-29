export enum EDirection {
    UP = 0,
    RIGHT,
    DOWN,
    LEFT
}

export enum EMode {
    IDLE = 0,
    MOVE
}

export interface Position {
    x: number;
    y: number;
}

// Position of a tile
export interface Tile {
    i: number;
    j: number;
}
