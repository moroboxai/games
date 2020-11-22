"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const yargs = require("yargs");
const helpers_1 = require("yargs/helpers");
const WINDOW_WIDTH = 640;
const WINDOW_HEIGHT = 360;
const argv = yargs(helpers_1.hideBin(process.argv)).command('game', 'Game').option('width', {
    description: 'Force window width',
    type: 'number',
    default: WINDOW_WIDTH
}).option('height', {
    description: 'Force window height',
    type: 'number',
    default: WINDOW_HEIGHT
}).help()
    .alias('help', 'h')
    .argv;
let mainWindow;
electron_1.app.on('ready', () => {
    mainWindow = new electron_1.BrowserWindow({
        width: argv.width,
        height: argv.height,
        useContentSize: true,
        resizable: true,
        webPreferences: {
            nodeIntegration: true
        }
    });
    mainWindow.loadFile(`${__dirname}/app/index.html`, { query: { options: JSON.stringify({
                nativeWidth: WINDOW_WIDTH,
                nativeHeight: WINDOW_HEIGHT
            }) } });
    mainWindow.on('closed', () => {
        mainWindow = null;
    });
});
electron_1.app.on('window-all-closed', () => {
    electron_1.app.quit();
});
//# sourceMappingURL=index.js.map