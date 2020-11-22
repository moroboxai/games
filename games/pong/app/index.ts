import * as MoroboxAIGameSDK from 'moroboxai-game-sdk';

require('game').boot({
    root: document.body,
    sdk: MoroboxAIGameSDK.createStandalone()
});
