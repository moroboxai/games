import type { Inputs } from "moroboxai-game-sdk";
import type { AgentGameState } from "./game";

/**
 * Random agent.
 *
 * This is the most basic agent, that returns
 * a random input each frame.
 *
 * The first step is to write an agent better
 * than this one !
 */
export function inputs(state: AgentGameState): Inputs {
    return [{ left: true }, { right: true }, { up: true }, { down: true }][
        Math.floor(Math.random() * 4)
    ];
}
