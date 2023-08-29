import * as MoroboxAIGameSDK from "moroboxai-game-sdk";
import { IGameState } from "./game";

const LABEL = "Random";

// If the agent is rotating to the left
var goingLeft: boolean;

function reset() {
    goingLeft = true;
}

function inputs(state: IGameState): MoroboxAIGameSDK.IInputs {
    // This agent presses left till the bunnies are rotated at -90,
    // degrees, then changes its direction to press right till they are
    // rotated at 90 degrees
    if (goingLeft) {
        if (state.angle > -90) {
            return { left: true };
        }

        goingLeft = false;
    }

    if (state.angle < 90) {
        return { right: true };
    }

    goingLeft = true;
    return {};
}
