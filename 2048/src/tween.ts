import Block, { EBlockMode } from "./block";
import { Position } from "./utils";

export interface ITween {
    readonly done: boolean;
    tick(delta: number): void;
    then(callback: () => void): void;
}

export abstract class TweenBase implements ITween {
    private _done: boolean = false;
    private _then?: () => void;

    get done(): boolean {
        return this._done;
    }

    tick(delta: number): void {
        throw new Error("Method not implemented.");
    }

    then(callback: () => void): void {
        this._then = callback;
    }

    complete() {
        this._done = true;
        if (this._then !== undefined) {
            this._then();
        }
    }
}

/**
 * Move a block to a target position.
 */
export class MoveBlockTween extends TweenBase {
    private _block: Block;
    private _target: Position;
    private _speed: number;

    constructor(block: Block, target: Position, speed: number) {
        super();
        this._block = block;
        this._target = target;
        this._speed = speed;
    }

    tick(delta: number): void {
        if (this.done) {
            return;
        }

        this._block.position.set(
            this._block.position.x +
                (this._target.x - this._block.position.x) * delta * this._speed,
            this._block.position.y +
                (this._target.y - this._block.position.y) * delta * this._speed
        );

        if (
            Math.abs(this._block.position.x - this._target.x) < 0.01 &&
            Math.abs(this._block.position.y - this._target.y) < 0.01
        ) {
            this._block.position.set(this._target.x, this._target.y);
            this.complete();
        }
    }
}

/**
 * Animation of a block merged with another.
 */
export class MergeBlockTween extends TweenBase {
    private _block: Block;
    private _speed: number;
    private _grow: boolean = true;
    private _maxScale: number = 1.25;

    constructor(block: Block, value: number, speed: number) {
        super();
        this._block = block;
        block.value = value;
        this._speed = speed;
    }

    tick(delta: number): void {
        if (this.done) {
            return;
        }

        if (this._grow) {
            let scale = this._block.scale.x + delta * this._speed;
            if (scale >= this._maxScale) {
                scale = this._maxScale;
                this._grow = false;
            }
            this._block.scale.set(scale, scale);
        } else {
            let scale = this._block.scale.x - delta * this._speed;
            if (scale <= 1) {
                scale = 1;
                this.complete();
            }
            this._block.scale.set(scale, scale);
        }
    }
}
