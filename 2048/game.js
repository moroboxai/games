/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else {
		var a = factory();
		for(var i in a) (typeof exports === 'object' ? exports : root)[i] = a[i];
	}
})(self, () => {
return /******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/block.ts":
/*!**********************!*\
  !*** ./src/block.ts ***!
  \**********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (/* binding */ Block)\n/* harmony export */ });\nclass Block extends PIXI.Sprite {\n    constructor(options) {\n        super();\n        this._style = options.style;\n        this.width = options.size;\n        this.height = options.size;\n        // Set background texture\n        this.texture = options.style.backgroundTexture;\n        // Create the label\n        this._text = new PIXI.BitmapText(\"\", {\n            fontName: \"MoroboxAIRetro\"\n        });\n        this._text.anchor = new PIXI.Point(0.5, 0.5);\n        this._text.position.set(this.width / 2, this.height / 2);\n        this.addChild(this._text);\n        this.value = 2;\n    }\n    get value() {\n        return this._value;\n    }\n    set value(val) {\n        this._value = val;\n        const text = val.toString();\n        const len = text.length;\n        this._text.text = text;\n        this._text.tint = this._style.colors[val].textColor;\n        this.tint = this._style.colors[val].backgroundColor;\n        if (len < 2) {\n            this._text.fontSize = this._style.smallFontSize;\n        }\n        else if (len < 3) {\n            this._text.fontSize = this._style.mediumFontSize;\n        }\n        else if (len < 4) {\n            this._text.fontSize = this._style.largeFontSize;\n        }\n        else if (len < 5) {\n            this._text.fontSize = this._style.xLargeFontSize;\n        }\n        else {\n            this._text.fontSize = this._style.xxLargeFontSize;\n        }\n    }\n}\n\n\n//# sourceURL=webpack://2048/./src/block.ts?");

/***/ }),

/***/ "./src/game.ts":
/*!*********************!*\
  !*** ./src/game.ts ***!
  \*********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   GameManager: () => (/* binding */ GameManager)\n/* harmony export */ });\n/* harmony import */ var _grid__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./grid */ \"./src/grid.ts\");\n/* harmony import */ var _header__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./header */ \"./src/header.ts\");\n/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./utils */ \"./src/utils.ts\");\n\n\n\n// Width and height of the grid (number of tiles)\nconst GRID_SIZE = 4;\n// Number of tiles at the start\nconst START_TILES = 2;\n// Size of the margins\nconst MARGIN_SIZE = 6;\n// Height of the header\nconst HEADER_HEIGHT = 16 + MARGIN_SIZE;\n// Default font\nconst FONT_NAME = \"MoroboxAIRetro\";\nconst HEADER_STYLE = {\n    backgroundTexture,\n    fontName: FONT_NAME,\n    fontSize: 16\n};\nconst GRID_STYLE = {\n    backgroundTexture,\n    emptyTileTexture,\n    marginSize: 6,\n    separatorSize: 4,\n    tileSize: 26,\n    blockStyle: {\n        backgroundTexture,\n        fontName: FONT_NAME,\n        smallFontSize: 16,\n        mediumFontSize: 12,\n        largeFontSize: 8,\n        xLargeFontSize: 6,\n        xxLargeFontSize: 4,\n        colors: Object.assign({}, ...[\n            [2, 0, 0xffffff],\n            [4, 0, 0xffffff],\n            [8, 0, 0xffffff],\n            [16, 0, 0xffffff],\n            [32, 0, 0xffffff],\n            [64, 0, 0xffffff],\n            [128, 0, 0xffffff],\n            [256, 0, 0xffffff],\n            [512, 0, 0xffffff],\n            [1024, 0, 0xffffff],\n            [2048, 0, 0xffffff],\n            [4096, 0, 0xffffff],\n            [8192, 0, 0xffffff],\n            [16384, 0, 0xffffff],\n            [32768, 0, 0xffffff]\n        ].map((options) => ({\n            [options[0]]: {\n                color: options[1],\n                backgroundColor: options[2]\n            }\n        })))\n    }\n};\nvar tileset;\nvar headerBackgroundTexture;\nvar backgroundTexture;\nvar emptyTileTexture;\nvar blockTexture;\nvar gameManager;\nclass GameManager extends PIXI.Container {\n    constructor() {\n        super();\n        this.header = new _header__WEBPACK_IMPORTED_MODULE_1__[\"default\"]({\n            width: vm.SWIDTH,\n            height: HEADER_HEIGHT,\n            style: HEADER_STYLE\n        });\n        this.grid = new _grid__WEBPACK_IMPORTED_MODULE_0__[\"default\"]({\n            size: GRID_SIZE,\n            startTiles: START_TILES,\n            style: GRID_STYLE\n        });\n        this.grid.position.set(0, this.header.height);\n        this.addChild(this.header);\n        this.addChild(this.grid);\n        this.reset();\n    }\n    reset() {\n        this.header.reset();\n        this.grid.reset();\n        this.mode = _utils__WEBPACK_IMPORTED_MODULE_2__.EMode.IDLE;\n        this.moveDirection = _utils__WEBPACK_IMPORTED_MODULE_2__.EDirection.UP;\n    }\n    move(direction) {\n        if (this.mode === _utils__WEBPACK_IMPORTED_MODULE_2__.EMode.MOVE) {\n            return;\n        }\n        this.mode = _utils__WEBPACK_IMPORTED_MODULE_2__.EMode.MOVE;\n    }\n    tick(delta) {\n        this.grid.tick(delta);\n    }\n    loadState(state) {\n        this.mode = state.mode;\n        this.moveDirection = state.moveDirection;\n        this.grid.loadState(state.grid);\n    }\n    saveState() {\n        // Send the blocks to agent\n        return {\n            mode: this.mode,\n            moveDirection: this.moveDirection,\n            grid: this.grid.saveState()\n        };\n    }\n}\n/**\n * Loads the game and its assets.\n */\nfunction load() {\n    console.log(\"load called\");\n    return new Promise((resolve, reject) => {\n        console.log(\"load assets\");\n        // use PIXI.Loader to load assets\n        const loader = new PIXI.Loader();\n        // load the font\n        loader.add(vm.player.gameServer.href(`assets/MoroboxAIRetro.fnt`));\n        // load the tileset\n        loader.add(\"tileset\", vm.player.gameServer.href(`assets/tileset.png`));\n        // notify when done\n        loader.onComplete.add(() => {\n            console.log(\"assets loaded\");\n            // generate textures used by the game\n            tileset = loader.resources.tileset.texture;\n            headerBackgroundTexture = new PIXI.Texture(tileset.baseTexture, new PIXI.Rectangle(0, 0, 16, 16));\n            backgroundTexture = new PIXI.Texture(tileset.baseTexture, new PIXI.Rectangle(0, 0, 16, 16));\n            const tileSize = GRID_STYLE.tileSize;\n            emptyTileTexture = new PIXI.Texture(tileset.baseTexture, new PIXI.Rectangle(19, 3, tileSize, tileSize));\n            blockTexture = {};\n            for (let i = 0; i < 16; ++i) {\n                blockTexture[Math.pow(2, i + 1)] = new PIXI.Texture(tileset.baseTexture, new PIXI.Rectangle(51 + i * (tileSize + 6), 3, tileSize, tileSize));\n            }\n            // Create the manager instance\n            gameManager = new GameManager();\n            stage.addChild(gameManager);\n            reset();\n            resolve();\n        });\n        // start loading assets\n        loader.load();\n    });\n}\n/**\n * Resets the state of the game.\n */\nfunction reset() {\n    gameManager.reset();\n}\n/**\n * Ticks the game.\n * @param {number} delta - elapsed time\n */\nfunction tick(inputs, delta) {\n    if (inputs[0].left) {\n        gameManager.move(_utils__WEBPACK_IMPORTED_MODULE_2__.EDirection.LEFT);\n    }\n    else if (inputs[0].right) {\n        gameManager.move(_utils__WEBPACK_IMPORTED_MODULE_2__.EDirection.RIGHT);\n    }\n    else if (inputs[0].up) {\n        gameManager.move(_utils__WEBPACK_IMPORTED_MODULE_2__.EDirection.UP);\n    }\n    else if (inputs[0].down) {\n        gameManager.move(_utils__WEBPACK_IMPORTED_MODULE_2__.EDirection.DOWN);\n    }\n    gameManager.tick(delta);\n}\nfunction loadState(state) {\n    gameManager.loadState(state);\n}\nfunction saveState() {\n    return gameManager.saveState();\n}\nfunction getStateForAgent() {\n    return saveState();\n}\n\n\n//# sourceURL=webpack://2048/./src/game.ts?");

/***/ }),

/***/ "./src/grid.ts":
/*!*********************!*\
  !*** ./src/grid.ts ***!
  \*********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (/* binding */ Grid)\n/* harmony export */ });\n/* harmony import */ var _block__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./block */ \"./src/block.ts\");\n\nclass Grid extends PIXI.Sprite {\n    constructor(options) {\n        super();\n        this._style = options.style;\n        this._size = options.size;\n        this._startTiles = options.startTiles;\n        const gutterSize = options.style.marginSize * 2 +\n            options.style.separatorSize * (options.size - 1);\n        this.width = gutterSize + options.style.tileSize * options.size;\n        this.height = this.width;\n        // Set background texture\n        this.texture = options.style.backgroundTexture;\n        // Create the tiles\n        this._blockPool = new Array();\n        this._tiles = new Array();\n        for (let i = 0; i < this._size; i++) {\n            let row = (this._tiles[i] = []);\n            for (let j = 0; j < this._size; j++) {\n                // Add a block to the pool\n                const tile = new _block__WEBPACK_IMPORTED_MODULE_0__[\"default\"]({\n                    size: options.style.tileSize,\n                    style: options.style.blockStyle\n                });\n                this._blockPool.push(tile);\n                row.push(null);\n                // Add a sprite for the tile\n                const position = this.tilePosition({ i, j });\n                const sprite = new PIXI.Sprite(options.style.emptyTileTexture);\n                sprite.alpha = 0.25;\n                sprite.position.set(position.x, position.y);\n                this.addChild(sprite);\n            }\n        }\n    }\n    reset() {\n        this.clear();\n        this.addStartBlocks();\n    }\n    clear() {\n        for (let i = 0; i < this._size; ++i) {\n            for (let j = 0; j < this._size; ++j) {\n                this.removeBlock({ i, j });\n            }\n        }\n    }\n    eachTile(callback) {\n        for (var i = 0; i < this._size; i++) {\n            for (var j = 0; j < this._size; j++) {\n                callback(i, j, this._tiles[i][j]);\n            }\n        }\n    }\n    availableTiles() {\n        let tiles = [];\n        this.eachTile((i, j, tile) => {\n            if (!tile) {\n                tiles.push({ i, j });\n            }\n        });\n        return tiles;\n    }\n    randomAvailableTile() {\n        var tiles = this.availableTiles();\n        if (tiles.length === 0) {\n            return undefined;\n        }\n        return tiles[Math.floor(Math.random() * tiles.length)];\n    }\n    get tilesAvailable() {\n        return this.availableTiles().length !== 0;\n    }\n    get movesAvailable() {\n        return this.tilesAvailable || this.blockMatchesAvailable;\n    }\n    getVector(direction) {\n        // Vectors representing tile movement\n        var map = {\n            0: { i: 0, j: -1 },\n            1: { i: 1, j: 0 },\n            2: { i: 0, j: 1 },\n            3: { i: -1, j: 0 } // Left\n        };\n        return map[direction];\n    }\n    get blockMatchesAvailable() {\n        var block;\n        for (var i = 0; i < this._size; i++) {\n            for (var j = 0; j < this._size; j++) {\n                block = this.tileContent({ i, j });\n                if (block) {\n                    for (var direction = 0; direction < 4; direction++) {\n                        var vector = this.getVector(direction);\n                        var tile = { i: i + vector.i, j: j + vector.j };\n                        var other = this.tileContent(tile);\n                        if (other && other.value === block.value) {\n                            return true; // These two blocks can be merged\n                        }\n                    }\n                }\n            }\n        }\n        return false;\n    }\n    withinBounds(position) {\n        return (position.i >= 0 &&\n            position.i < this._size &&\n            position.j >= 0 &&\n            position.j < this._size);\n    }\n    tileContent(tile) {\n        if (this.withinBounds(tile)) {\n            return this._tiles[tile.i][tile.j];\n        }\n        else {\n            return null;\n        }\n    }\n    tileOccupied(tile) {\n        return this.tileContent(tile) !== null;\n    }\n    tileAvailable(tile) {\n        return !this.tileOccupied(tile);\n    }\n    addStartBlocks() {\n        for (let i = 0; i < this._startTiles; ++i) {\n            this.addRandomBlock();\n        }\n    }\n    addRandomBlock() {\n        if (!this.tilesAvailable) {\n            return;\n        }\n        var value = Math.random() < 0.9 ? 2 : 4;\n        this.insertBlock(this.randomAvailableTile(), value);\n    }\n    insertBlock(tile, value) {\n        const block = this._blockPool.pop();\n        if (block !== undefined) {\n            this.addChild(block);\n            const position = this.tilePosition(tile);\n            block.position.set(position.x, position.y);\n            block.value = value;\n            this._tiles[tile.i][tile.j] = block;\n        }\n    }\n    removeBlock(tile) {\n        if (this._tiles[tile.i][tile.j] !== null) {\n            const block = this._tiles[tile.i][tile.j];\n            this.removeChild(block);\n            this._blockPool.push(block);\n            this._tiles[tile.i][tile.j] = null;\n        }\n    }\n    tilePosition(tile) {\n        return {\n            x: this._style.marginSize +\n                (this._style.tileSize + this._style.separatorSize) * tile.i,\n            y: this._style.marginSize +\n                (this._style.tileSize + this._style.separatorSize) * tile.j\n        };\n    }\n    buildTraversals(vector) {\n        var traversals = { x: [], y: [] };\n        for (var pos = 0; pos < this._size; pos++) {\n            traversals.x.push(pos);\n            traversals.y.push(pos);\n        }\n        // Always traverse from the farthest cell in the chosen direction\n        if (vector.x === 1)\n            traversals.x = traversals.x.reverse();\n        if (vector.y === 1)\n            traversals.y = traversals.y.reverse();\n        return traversals;\n    }\n    loadState(state) {\n        this.clear();\n        state.map((line, i) => line.map((value, j) => {\n            if (value !== 0) {\n                this.insertBlock({ i, j }, value);\n            }\n        }));\n    }\n    saveState() {\n        return this._tiles.map((line) => line.map((block) => (block !== null ? block.value : 0)));\n    }\n    tick(delta) {\n        this._blockPool.forEach((block) => {\n            if (block.targetPosition === undefined) {\n                return;\n            }\n            this.position.set((block.targetPosition.x - this.position.x) * delta, (block.targetPosition.y - this.position.y) * delta);\n        });\n    }\n}\n\n\n//# sourceURL=webpack://2048/./src/grid.ts?");

/***/ }),

/***/ "./src/header.ts":
/*!***********************!*\
  !*** ./src/header.ts ***!
  \***********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (/* binding */ Header)\n/* harmony export */ });\nclass Header extends PIXI.Container {\n    constructor(options) {\n        super();\n        // Create the background sprite\n        const background = new PIXI.Sprite(options.style.backgroundTexture);\n        background.width = options.width;\n        background.height = options.height;\n        this.addChild(background);\n        // Create the text\n        this._text = new PIXI.BitmapText(\"\", {\n            fontName: options.style.fontName,\n            fontSize: options.style.fontSize\n        });\n        this._text.anchor = new PIXI.Point(0.5, 1);\n        this._text.position.set(background.width / 2, background.height);\n        this.addChild(this._text);\n    }\n    set score(val) {\n        this._score = val;\n        this._text.text = val.toString();\n    }\n    reset() {\n        this.score = 0;\n    }\n}\n\n\n//# sourceURL=webpack://2048/./src/header.ts?");

/***/ }),

/***/ "./src/utils.ts":
/*!**********************!*\
  !*** ./src/utils.ts ***!
  \**********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   EDirection: () => (/* binding */ EDirection),\n/* harmony export */   EMode: () => (/* binding */ EMode)\n/* harmony export */ });\nvar EDirection;\n(function (EDirection) {\n    EDirection[EDirection[\"UP\"] = 0] = \"UP\";\n    EDirection[EDirection[\"RIGHT\"] = 1] = \"RIGHT\";\n    EDirection[EDirection[\"DOWN\"] = 2] = \"DOWN\";\n    EDirection[EDirection[\"LEFT\"] = 3] = \"LEFT\";\n})(EDirection || (EDirection = {}));\nvar EMode;\n(function (EMode) {\n    EMode[EMode[\"IDLE\"] = 0] = \"IDLE\";\n    EMode[EMode[\"MOVE\"] = 1] = \"MOVE\";\n})(EMode || (EMode = {}));\n\n\n//# sourceURL=webpack://2048/./src/utils.ts?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = __webpack_require__("./src/game.ts");
/******/ 	
/******/ 	return __webpack_exports__;
/******/ })()
;
});