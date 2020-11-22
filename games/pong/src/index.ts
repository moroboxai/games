import { app as ElectronApp, BrowserWindow } from 'electron';
import * as yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

const WINDOW_WIDTH: number = 640;
const WINDOW_HEIGHT: number = 360;

// parse command line arguments
const argv = yargs(hideBin(process.argv)).command(
    'game', 'Game'
).option<string, yargs.Options>(
    'width', {
        description: 'Force window width',
        type: 'number',
        default: WINDOW_WIDTH
}).option<string, yargs.Options>(
    'height', {
        description: 'Force window height',
        type: 'number',
        default: WINDOW_HEIGHT
}).help()
.alias('help', 'h')
.argv;

// create and display main window, pass arguments
let mainWindow: Electron.BrowserWindow;

ElectronApp.on('ready', () => {
    mainWindow = new BrowserWindow({
        width: argv.width as number,
        height: argv.height as number,
        useContentSize: true,
        resizable: true,
        webPreferences: {
            nodeIntegration: true
        }
    });
    mainWindow.loadFile(`${__dirname}/app/index.html`, {query: {options: JSON.stringify({
        nativeWidth: WINDOW_WIDTH,
        nativeHeight: WINDOW_HEIGHT
    })}});
    mainWindow.on('closed', () => {
        mainWindow = null;
    });
});

ElectronApp.on('window-all-closed', () => {
    ElectronApp.quit();
});
