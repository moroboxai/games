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

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   EBlockMode: () => (/* binding */ EBlockMode),\n/* harmony export */   \"default\": () => (/* binding */ Block)\n/* harmony export */ });\nvar EBlockMode;\n(function (EBlockMode) {\n    EBlockMode[EBlockMode[\"IDLE\"] = 0] = \"IDLE\";\n    EBlockMode[EBlockMode[\"MOVE\"] = 1] = \"MOVE\";\n    EBlockMode[EBlockMode[\"MOVE_AND_MERGE\"] = 2] = \"MOVE_AND_MERGE\";\n    EBlockMode[EBlockMode[\"MERGE\"] = 3] = \"MERGE\";\n})(EBlockMode || (EBlockMode = {}));\nclass Block extends PIXI.Sprite {\n    constructor(options) {\n        super();\n        this.mode = EBlockMode.IDLE;\n        this._style = options.style;\n        this.width = options.size;\n        this.height = options.size;\n        this.anchor.set(0.5, 0.5);\n        // Set background texture\n        this.texture = options.style.backgroundTexture;\n        // Create the label\n        this._text = new PIXI.BitmapText(\"\", {\n            fontName: options.style.fontName\n        });\n        this._text.anchor = new PIXI.Point(0.5, 0.5);\n        this._text.position.set(0, 0);\n        this.addChild(this._text);\n        this.value = 2;\n    }\n    get value() {\n        return this._value;\n    }\n    set value(val) {\n        this._value = val;\n        const text = val.toString();\n        const len = text.length;\n        this._text.text = text;\n        this._text.tint = this._style.colors[val].textColor;\n        this.tint = this._style.colors[val].backgroundColor;\n        if (len < 2) {\n            this._text.fontSize = this._style.smallFontSize;\n        }\n        else if (len < 3) {\n            this._text.fontSize = this._style.mediumFontSize;\n        }\n        else if (len < 4) {\n            this._text.fontSize = this._style.largeFontSize;\n        }\n        else if (len < 5) {\n            this._text.fontSize = this._style.xLargeFontSize;\n        }\n        else {\n            this._text.fontSize = this._style.xxLargeFontSize;\n        }\n    }\n}\n\n\n//# sourceURL=webpack://2048/./src/block.ts?");

/***/ }),

/***/ "./src/game.ts":
/*!*********************!*\
  !*** ./src/game.ts ***!
  \*********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   getStateForAgent: () => (/* binding */ getStateForAgent),\n/* harmony export */   load: () => (/* binding */ load),\n/* harmony export */   loadState: () => (/* binding */ loadState),\n/* harmony export */   saveState: () => (/* binding */ saveState),\n/* harmony export */   tick: () => (/* binding */ tick)\n/* harmony export */ });\n/* harmony import */ var _grid__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./grid */ \"./src/grid.ts\");\n/* harmony import */ var _header__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./header */ \"./src/header.ts\");\n/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./utils */ \"./src/utils.ts\");\n/* harmony import */ var _block__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./block */ \"./src/block.ts\");\n/* harmony import */ var _tween__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./tween */ \"./src/tween.ts\");\n\n\n\n\n\n// Width and height of the grid (number of tiles)\nconst GRID_SIZE = 4;\n// Number of tiles at the start\nconst START_TILES = 2;\n// Size of the margins\nconst MARGIN_SIZE = 6;\n// Height of the header\nconst HEADER_HEIGHT = 16 + MARGIN_SIZE;\n// Default font\nconst FONT_NAME = \"MoroboxAIRetro\";\nconst HEADER_STYLE = {\n    backgroundTexture,\n    fontName: FONT_NAME,\n    fontSize: 16\n};\nconst BLOCK_STYLE = {\n    backgroundTexture,\n    fontName: FONT_NAME,\n    smallFontSize: 16,\n    mediumFontSize: 12,\n    largeFontSize: 8,\n    xLargeFontSize: 6,\n    xxLargeFontSize: 4,\n    colors: Object.assign({}, ...[\n        [2, 0, 0xffffff],\n        [4, 0, 0xffffff],\n        [8, 0, 0xffffff],\n        [16, 0, 0xffffff],\n        [32, 0, 0xffffff],\n        [64, 0, 0xffffff],\n        [128, 0, 0xffffff],\n        [256, 0, 0xffffff],\n        [512, 0, 0xffffff],\n        [1024, 0, 0xffffff],\n        [2048, 0, 0xffffff],\n        [4096, 0, 0xffffff],\n        [8192, 0, 0xffffff],\n        [16384, 0, 0xffffff],\n        [32768, 0, 0xffffff]\n    ].map((options) => ({\n        [options[0]]: {\n            color: options[1],\n            backgroundColor: options[2]\n        }\n    })))\n};\nconst GRID_STYLE = {\n    backgroundTexture,\n    emptyTileTexture,\n    marginSize: 6,\n    separatorSize: 4,\n    tileSize: 26\n};\nvar tileset;\nvar backgroundTexture;\nvar emptyTileTexture;\nvar gameManager;\nvar EGameMode;\n(function (EGameMode) {\n    EGameMode[EGameMode[\"PLAY\"] = 0] = \"PLAY\";\n    EGameMode[EGameMode[\"GAME_OVER\"] = 1] = \"GAME_OVER\";\n})(EGameMode || (EGameMode = {}));\nclass GameManager extends PIXI.Container {\n    constructor() {\n        super();\n        this._blockPool = [];\n        this._tweens = [];\n        // Create the UI\n        this.header = new _header__WEBPACK_IMPORTED_MODULE_1__[\"default\"]({\n            width: vm.SWIDTH,\n            height: HEADER_HEIGHT,\n            style: HEADER_STYLE\n        });\n        this.addChild(this.header);\n        // Create the grid\n        this.grid = new _grid__WEBPACK_IMPORTED_MODULE_0__[\"default\"]({\n            size: GRID_SIZE,\n            style: GRID_STYLE\n        });\n        this.grid.position.set(0, this.header.height);\n        this.grid.sortableChildren = true;\n        this.addChild(this.grid);\n        this._startTiles = START_TILES;\n        // Create a pool of blocks\n        const tile = new _block__WEBPACK_IMPORTED_MODULE_3__[\"default\"]({\n            size: GRID_STYLE.tileSize,\n            style: BLOCK_STYLE\n        });\n        this._blockPool.push(tile);\n        this.reset();\n    }\n    reset() {\n        this.header.reset();\n        this.clear();\n        this.addStartBlocks();\n        this.mode = EGameMode.PLAY;\n        this.moveDirection = _utils__WEBPACK_IMPORTED_MODULE_2__.EDirection.UP;\n    }\n    clear() {\n        for (let i = 0; i < this.grid.size; ++i) {\n            for (let j = 0; j < this.grid.size; ++j) {\n                this.removeBlock({ i, j });\n            }\n        }\n    }\n    acquireBlock() {\n        const block = this._blockPool.pop();\n        if (block !== undefined) {\n            return block;\n        }\n        return new _block__WEBPACK_IMPORTED_MODULE_3__[\"default\"]({\n            size: GRID_STYLE.tileSize,\n            style: BLOCK_STYLE\n        });\n    }\n    releaseBlock(block) {\n        this.grid.removeChild(block);\n        this._blockPool.push(block);\n    }\n    addStartBlocks() {\n        for (let i = 0; i < this._startTiles; ++i) {\n            this.addRandomBlock();\n        }\n    }\n    addRandomBlock() {\n        if (this.grid.tilesAvailable) {\n            this.insertBlock(this.grid.randomAvailableTile(), Math.random() < 0.9 ? 2 : 4);\n        }\n    }\n    insertBlock(tile, value) {\n        const position = this.grid.tilePosition(tile);\n        const block = this.acquireBlock();\n        block.mode = _block__WEBPACK_IMPORTED_MODULE_3__.EBlockMode.IDLE;\n        block.value = value;\n        block.position.set(position.x, position.y);\n        this.grid.addChild(block);\n        this.grid.setBlock(tile, block);\n    }\n    removeBlock(tile) {\n        const block = this.grid.tileContent(tile);\n        if (block !== null) {\n            this.grid.setBlock(tile, null);\n            this.releaseBlock(block);\n        }\n    }\n    moveBlock(from, to) {\n        const block = this.grid.tileContent(from);\n        if (block === null) {\n            return;\n        }\n        block.zIndex = 0;\n        // Clear the source tile\n        this.grid.setBlock(from, null);\n        // Move animation\n        const moveTween = new _tween__WEBPACK_IMPORTED_MODULE_4__.MoveBlockTween(block, this.grid.tilePosition(to), 0.25);\n        moveTween.then(() => {\n            block.mode = _block__WEBPACK_IMPORTED_MODULE_3__.EBlockMode.IDLE;\n        });\n        this._tweens.push(moveTween);\n        // Check if merge possible\n        const destBlock = this.grid.tileContent(to);\n        if (destBlock !== null) {\n            destBlock.mode = _block__WEBPACK_IMPORTED_MODULE_3__.EBlockMode.MERGE;\n            destBlock.zIndex = 1;\n            block.mode = _block__WEBPACK_IMPORTED_MODULE_3__.EBlockMode.MOVE_AND_MERGE;\n            // Merge animation\n            const mergeTween = new _tween__WEBPACK_IMPORTED_MODULE_4__.MergeBlockTween(destBlock, destBlock.value * 2, 0.1);\n            mergeTween.then(() => {\n                destBlock.mode = _block__WEBPACK_IMPORTED_MODULE_3__.EBlockMode.IDLE;\n            });\n            this._tweens.push(mergeTween);\n            // Remove the moving block after\n            moveTween.then(() => {\n                this.releaseBlock(block);\n            });\n        }\n        else {\n            // Set the destination tile\n            this.grid.setBlock(to, block);\n            block.mode = _block__WEBPACK_IMPORTED_MODULE_3__.EBlockMode.MOVE;\n        }\n    }\n    move(direction) {\n        if (this.mode !== EGameMode.PLAY || this._tweens.length > 0) {\n            return;\n        }\n        let moved = false;\n        const vector = (0,_utils__WEBPACK_IMPORTED_MODULE_2__.getVector)(direction);\n        const traversals = this.grid.buildTraversals(vector);\n        // Traverse the grid in the right direction and move tiles\n        traversals.x.forEach((x) => {\n            traversals.y.forEach((y) => {\n                let tile = { i: x, j: y };\n                let block = this.grid.tileContent(tile);\n                if (block === null) {\n                    return;\n                }\n                const currentPosition = {\n                    x: block.position.x,\n                    y: block.position.y\n                };\n                const positions = this.grid.findFarthestPosition(tile, vector);\n                const next = this.grid.tileContent(positions.next);\n                if (next !== null &&\n                    next !== block &&\n                    next.mode !== _block__WEBPACK_IMPORTED_MODULE_3__.EBlockMode.MOVE_AND_MERGE &&\n                    next.mode !== _block__WEBPACK_IMPORTED_MODULE_3__.EBlockMode.MERGE &&\n                    next.value === block.value) {\n                    this.moveBlock(tile, positions.next);\n                    moved = true;\n                }\n                else if (positions.farthest !== tile) {\n                    this.moveBlock(tile, positions.farthest);\n                    moved = true;\n                }\n            });\n        });\n        if (moved) {\n            this.addRandomBlock();\n            if (!this.grid.movesAvailable) {\n                this.mode = EGameMode.GAME_OVER;\n            }\n        }\n    }\n    tick(delta) {\n        for (let i = 0; i < this._tweens.length; ++i) {\n            this._tweens[i].tick(delta);\n            if (this._tweens[i].done) {\n                this._tweens.splice(i, 1);\n                --i;\n            }\n        }\n    }\n    loadState(state) {\n        this.mode = state.mode;\n        this.moveDirection = state.moveDirection;\n        this.clear();\n        state.grid.map((line, i) => line.map((value, j) => {\n            if (value !== 0) {\n                this.insertBlock({ i, j }, value);\n            }\n        }));\n    }\n    saveState() {\n        // Send the blocks to agent\n        return {\n            mode: this.mode,\n            moveDirection: this.moveDirection,\n            grid: this.grid.saveState()\n        };\n    }\n}\n/**\n * Loads the game and its assets.\n */\nfunction load() {\n    console.log(\"load called\");\n    return new Promise((resolve, reject) => {\n        console.log(\"load assets\");\n        // use PIXI.Loader to load assets\n        const loader = new PIXI.Loader();\n        // load the font\n        loader.add(vm.player.gameServer.href(`assets/MoroboxAIRetro.fnt`));\n        // load the tileset\n        loader.add(\"tileset\", vm.player.gameServer.href(`assets/tileset.png`));\n        // notify when done\n        loader.onComplete.add(() => {\n            console.log(\"assets loaded\");\n            // generate textures used by the game\n            tileset = loader.resources.tileset.texture;\n            HEADER_STYLE.backgroundTexture = new PIXI.Texture(tileset.baseTexture, new PIXI.Rectangle(0, 0, 16, 16));\n            GRID_STYLE.backgroundTexture = new PIXI.Texture(tileset.baseTexture, new PIXI.Rectangle(0, 0, 16, 16));\n            const tileSize = GRID_STYLE.tileSize;\n            GRID_STYLE.emptyTileTexture = new PIXI.Texture(tileset.baseTexture, new PIXI.Rectangle(19, 3, tileSize, tileSize));\n            BLOCK_STYLE.backgroundTexture = new PIXI.Texture(tileset.baseTexture, new PIXI.Rectangle(19, 3, tileSize, tileSize));\n            // Create the manager instance\n            gameManager = new GameManager();\n            gameManager.reset();\n            stage.addChild(gameManager);\n            resolve();\n        });\n        // start loading assets\n        loader.load();\n    });\n}\n/**\n * Ticks the game.\n * @param {number} delta - elapsed time\n */\nfunction tick(inputs, delta) {\n    if (inputs[0].left) {\n        gameManager.move(_utils__WEBPACK_IMPORTED_MODULE_2__.EDirection.LEFT);\n    }\n    else if (inputs[0].right) {\n        gameManager.move(_utils__WEBPACK_IMPORTED_MODULE_2__.EDirection.RIGHT);\n    }\n    else if (inputs[0].up) {\n        gameManager.move(_utils__WEBPACK_IMPORTED_MODULE_2__.EDirection.UP);\n    }\n    else if (inputs[0].down) {\n        gameManager.move(_utils__WEBPACK_IMPORTED_MODULE_2__.EDirection.DOWN);\n    }\n    gameManager.tick(delta);\n}\nfunction loadState(state) {\n    gameManager.loadState(state);\n}\nfunction saveState() {\n    return gameManager.saveState();\n}\nfunction getStateForAgent() {\n    return saveState();\n}\n\n\n//# sourceURL=webpack://2048/./src/game.ts?");

/***/ }),

/***/ "./src/grid.ts":
/*!*********************!*\
  !*** ./src/grid.ts ***!
  \*********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (/* binding */ Grid)\n/* harmony export */ });\nclass Grid extends PIXI.Container {\n    constructor(options) {\n        super();\n        this._style = options.style;\n        this._size = options.size;\n        // Create the background\n        const background = new PIXI.Sprite(options.style.backgroundTexture);\n        const gutterSize = options.style.marginSize * 2 +\n            options.style.separatorSize * (options.size - 1);\n        background.width = gutterSize + options.style.tileSize * options.size;\n        background.height = background.width;\n        this.addChild(background);\n        // Create the tiles\n        this._tiles = new Array();\n        for (let i = 0; i < this._size; i++) {\n            let row = (this._tiles[i] = []);\n            for (let j = 0; j < this._size; j++) {\n                row.push(null);\n                // Add a sprite for the tile\n                const position = this.tilePosition({ i, j });\n                const sprite = new PIXI.Sprite(options.style.emptyTileTexture);\n                sprite.alpha = 0.25;\n                sprite.anchor.set(0.5);\n                sprite.position.set(position.x, position.y);\n                this.addChild(sprite);\n            }\n        }\n    }\n    get size() {\n        return this._size;\n    }\n    eachTile(callback) {\n        for (var i = 0; i < this._size; i++) {\n            for (var j = 0; j < this._size; j++) {\n                callback(i, j, this._tiles[i][j]);\n            }\n        }\n    }\n    availableTiles() {\n        let tiles = [];\n        this.eachTile((i, j, tile) => {\n            if (!tile) {\n                tiles.push({ i, j });\n            }\n        });\n        return tiles;\n    }\n    randomAvailableTile() {\n        var tiles = this.availableTiles();\n        if (tiles.length === 0) {\n            return undefined;\n        }\n        return tiles[Math.floor(Math.random() * tiles.length)];\n    }\n    get tilesAvailable() {\n        return this.availableTiles().length !== 0;\n    }\n    get movesAvailable() {\n        return this.tilesAvailable || this.blockMatchesAvailable;\n    }\n    getVector(direction) {\n        // Vectors representing tile movement\n        var map = {\n            0: { i: 0, j: -1 },\n            1: { i: 1, j: 0 },\n            2: { i: 0, j: 1 },\n            3: { i: -1, j: 0 } // Left\n        };\n        return map[direction];\n    }\n    get blockMatchesAvailable() {\n        var block;\n        for (var i = 0; i < this._size; i++) {\n            for (var j = 0; j < this._size; j++) {\n                block = this.tileContent({ i, j });\n                if (block) {\n                    for (var direction = 0; direction < 4; direction++) {\n                        var vector = this.getVector(direction);\n                        var tile = { i: i + vector.i, j: j + vector.j };\n                        var other = this.tileContent(tile);\n                        if (other && other.value === block.value) {\n                            return true; // These two blocks can be merged\n                        }\n                    }\n                }\n            }\n        }\n        return false;\n    }\n    withinBounds(position) {\n        return (position.i >= 0 &&\n            position.i < this._size &&\n            position.j >= 0 &&\n            position.j < this._size);\n    }\n    tileContent(tile) {\n        if (this.withinBounds(tile)) {\n            return this._tiles[tile.i][tile.j];\n        }\n        else {\n            return null;\n        }\n    }\n    tileOccupied(tile) {\n        return this.tileContent(tile) !== null;\n    }\n    tileAvailable(tile) {\n        return !this.tileOccupied(tile);\n    }\n    setBlock(tile, block) {\n        this._tiles[tile.i][tile.j] = block;\n    }\n    tilePosition(tile) {\n        return {\n            x: this._style.marginSize +\n                (this._style.tileSize + this._style.separatorSize) * tile.i +\n                this._style.tileSize / 2,\n            y: this._style.marginSize +\n                (this._style.tileSize + this._style.separatorSize) * tile.j +\n                this._style.tileSize / 2\n        };\n    }\n    findFarthestPosition(tile, vector) {\n        let previous;\n        // Progress towards the vector direction until an obstacle is found\n        do {\n            previous = tile;\n            tile = { i: previous.i + vector.x, j: previous.j + vector.y };\n        } while (this.withinBounds(tile) && this.tileAvailable(tile));\n        return {\n            farthest: previous,\n            next: tile // Used to check if a merge is required\n        };\n    }\n    buildTraversals(vector) {\n        var traversals = { x: [], y: [] };\n        for (var pos = 0; pos < this._size; pos++) {\n            traversals.x.push(pos);\n            traversals.y.push(pos);\n        }\n        // Always traverse from the farthest cell in the chosen direction\n        if (vector.x === 1)\n            traversals.x = traversals.x.reverse();\n        if (vector.y === 1)\n            traversals.y = traversals.y.reverse();\n        return traversals;\n    }\n    saveState() {\n        return this._tiles.map((line) => line.map((block) => (block !== null ? block.value : 0)));\n    }\n}\n\n\n//# sourceURL=webpack://2048/./src/grid.ts?");

/***/ }),

/***/ "./src/header.ts":
/*!***********************!*\
  !*** ./src/header.ts ***!
  \***********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (/* binding */ Header)\n/* harmony export */ });\nclass Header extends PIXI.Container {\n    constructor(options) {\n        super();\n        // Create the background sprite\n        const background = new PIXI.Sprite(options.style.backgroundTexture);\n        background.width = options.width;\n        background.height = options.height;\n        this.addChild(background);\n        // Create the text\n        this._text = new PIXI.BitmapText(\"\", {\n            fontName: options.style.fontName,\n            fontSize: options.style.fontSize\n        });\n        this._text.anchor = new PIXI.Point(0.5, 1);\n        this._text.position.set(background.width / 2, background.height);\n        this.addChild(this._text);\n    }\n    set score(val) {\n        this._score = val;\n        this._text.text = val.toString();\n    }\n    reset() {\n        this.score = 0;\n    }\n}\n\n\n//# sourceURL=webpack://2048/./src/header.ts?");

/***/ }),

/***/ "./src/tween.ts":
/*!**********************!*\
  !*** ./src/tween.ts ***!
  \**********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   MergeBlockTween: () => (/* binding */ MergeBlockTween),\n/* harmony export */   MoveBlockTween: () => (/* binding */ MoveBlockTween),\n/* harmony export */   TweenBase: () => (/* binding */ TweenBase)\n/* harmony export */ });\nclass TweenBase {\n    constructor() {\n        this._done = false;\n    }\n    get done() {\n        return this._done;\n    }\n    tick(delta) {\n        throw new Error(\"Method not implemented.\");\n    }\n    then(callback) {\n        this._then = callback;\n    }\n    complete() {\n        this._done = true;\n        if (this._then !== undefined) {\n            this._then();\n        }\n    }\n}\n/**\n * Move a block to a target position.\n */\nclass MoveBlockTween extends TweenBase {\n    constructor(block, target, speed) {\n        super();\n        this._block = block;\n        this._target = target;\n        this._speed = speed;\n    }\n    tick(delta) {\n        if (this.done) {\n            return;\n        }\n        this._block.position.set(this._block.position.x +\n            (this._target.x - this._block.position.x) * delta * this._speed, this._block.position.y +\n            (this._target.y - this._block.position.y) * delta * this._speed);\n        if (Math.abs(this._block.position.x - this._target.x) < 0.01 &&\n            Math.abs(this._block.position.y - this._target.y) < 0.01) {\n            this._block.position.set(this._target.x, this._target.y);\n            this.complete();\n        }\n    }\n}\n/**\n * Animation of a block merged with another.\n */\nclass MergeBlockTween extends TweenBase {\n    constructor(block, value, speed) {\n        super();\n        this._grow = true;\n        this._maxScale = 1.25;\n        this._block = block;\n        block.value = value;\n        this._speed = speed;\n    }\n    tick(delta) {\n        if (this.done) {\n            return;\n        }\n        if (this._grow) {\n            let scale = this._block.scale.x + delta * this._speed;\n            if (scale >= this._maxScale) {\n                scale = this._maxScale;\n                this._grow = false;\n            }\n            this._block.scale.set(scale, scale);\n        }\n        else {\n            let scale = this._block.scale.x - delta * this._speed;\n            if (scale <= 1) {\n                scale = 1;\n                this.complete();\n            }\n            this._block.scale.set(scale, scale);\n        }\n    }\n}\n\n\n//# sourceURL=webpack://2048/./src/tween.ts?");

/***/ }),

/***/ "./src/utils.ts":
/*!**********************!*\
  !*** ./src/utils.ts ***!
  \**********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   EDirection: () => (/* binding */ EDirection),\n/* harmony export */   getVector: () => (/* binding */ getVector)\n/* harmony export */ });\nvar EDirection;\n(function (EDirection) {\n    EDirection[EDirection[\"UP\"] = 0] = \"UP\";\n    EDirection[EDirection[\"RIGHT\"] = 1] = \"RIGHT\";\n    EDirection[EDirection[\"DOWN\"] = 2] = \"DOWN\";\n    EDirection[EDirection[\"LEFT\"] = 3] = \"LEFT\";\n})(EDirection || (EDirection = {}));\nfunction getVector(direction) {\n    // Vectors representing tile movement\n    var map = {\n        0: { x: 0, y: -1 },\n        1: { x: 1, y: 0 },\n        2: { x: 0, y: 1 },\n        3: { x: -1, y: 0 } // Left\n    };\n    return map[direction];\n}\n\n\n//# sourceURL=webpack://2048/./src/utils.ts?");

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