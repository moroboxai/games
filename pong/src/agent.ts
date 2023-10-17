import type { Inputs } from "moroboxai-game-sdk";
import type { AgentGameState } from "./game";

/**
 * The state of the game is in the form:
 * {
 *   ball: {x: number, y: number},
 *   bars: [
 *     {x: number, y: number},
 *     {x: number, y: number}
 *   ]
 * }
 *
 * This function must return inputs done by
 * the agent for current frame in the form:
 * {
 *   left?: boolean,
 *   right?: boolean,
 *   up?: boolean,
 *   down?: boolean
 * }
 *
 * Happy hacking :)
 */
export function inputs(state: AgentGameState): Inputs {
    return {
        up: state.ball.y < state.bars[0].y,
        down: state.ball.y > state.bars[0].y,
    };
}
