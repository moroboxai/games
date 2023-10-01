export enum EDirection {
    UP = 0,
    RIGHT,
    DOWN,
    LEFT
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

export function getVector(direction: EDirection): Position {
    // Vectors representing tile movement
    var map = {
        0: { x: 0, y: -1 }, // Up
        1: { x: 1, y: 0 }, // Right
        2: { x: 0, y: 1 }, // Down
        3: { x: -1, y: 0 } // Left
    };

    return map[direction];
}
