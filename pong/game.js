(function(global, factory) {
  typeof exports === "object" && typeof module !== "undefined" ? factory(exports) : typeof define === "function" && define.amd ? define(["exports"], factory) : (global = typeof globalThis !== "undefined" ? globalThis : global || self, factory(global.Game = {}));
})(this, function(exports2) {
  "use strict";
  const COLOR_MEDIUM = 3170864;
  const COLOR_LIGHT = 9153551;
  const HEADER_HEIGHT = 8;
  const HSWIDTH = SWIDTH / 2;
  const HSHEIGHT = SHEIGHT / 2;
  const TOP_GAME_Y = HEADER_HEIGHT;
  const BOTTOM_GAME_Y = SHEIGHT - HEADER_HEIGHT;
  const BAR_HEIGHT = 12;
  const BAR_WIDTH = 4;
  const BAR_SPEED = 1;
  const BAR_X_OFFSET = 0.1;
  const BAR_AI_THRESHOLD = 0.25;
  const BALL_SIZE = 2;
  const BALL_ANGLES = [45, -45, 135, 225];
  const BALL_SPEED = 1;
  const BALL_ACCELERATION = 1.05;
  const MAX_SCORE = 99;
  const TILEMAP = tmap("tilemap");
  const FONT = fnt("MoroboxAIRetro");
  const AI_LEVELS = [
    { reaction: 0.2, error: 40 },
    // 0:  ai is losing by 8
    { reaction: 0.3, error: 50 },
    // 1:  ai is losing by 7
    { reaction: 0.4, error: 60 },
    // 2:  ai is losing by 6
    { reaction: 0.5, error: 70 },
    // 3:  ai is losing by 5
    { reaction: 0.6, error: 80 },
    // 4:  ai is losing by 4
    { reaction: 0.7, error: 90 },
    // 5:  ai is losing by 3
    { reaction: 0.8, error: 100 },
    // 6:  ai is losing by 2
    { reaction: 0.9, error: 110 },
    // 7:  ai is losing by 1
    { reaction: 1, error: 120 },
    // 8:  tie
    { reaction: 1.1, error: 130 },
    // 9:  ai is winning by 1
    { reaction: 1.2, error: 140 },
    // 10: ai is winning by 2
    { reaction: 1.3, error: 150 },
    // 11: ai is winning by 3
    { reaction: 1.4, error: 160 },
    // 12: ai is winning by 4
    { reaction: 1.5, error: 170 },
    // 13: ai is winning by 5
    { reaction: 1.6, error: 180 },
    // 14: ai is winning by 6
    { reaction: 1.7, error: 190 },
    // 15: ai is winning by 7
    { reaction: 1.8, error: 200 }
    // 16: ai is winning by 8
  ];
  const AI_LEVEL_MEDIUM = 8;
  class Entity {
    constructor(width, height) {
      this.x = 0;
      this.y = 0;
      this.width = width;
      this.height = height;
    }
    get hwidth() {
      return this.width / 2;
    }
    get hheight() {
      return this.height / 2;
    }
    get left() {
      return this.x - this.hwidth;
    }
    get right() {
      return this.x + this.hwidth;
    }
    get top() {
      return this.y - this.hheight;
    }
    get bottom() {
      return this.y + this.hheight;
    }
    // Get the state of this entity as a JSON dict
    get state() {
      throw new Error("state must be implemented");
    }
    // Update the physics
    update(deltaTime) {
      throw new Error("update must be implemented");
    }
    // Draw the sprite
    draw() {
      throw new Error("draw must be implemented");
    }
  }
  class Bar extends Entity {
    constructor(controller, width, height) {
      super(width, height);
      this._controller = controller;
    }
    // Informations sent to AIs
    get state() {
      return {
        x: this.x,
        y: this.y
      };
    }
    // Update bar position and check collisions with screen bounds
    update(delta) {
      const inputs = this._controller.inputs();
      if (inputs.up) {
        this.y -= BAR_SPEED * delta;
      } else if (inputs.down) {
        this.y += BAR_SPEED * delta;
      }
      if (this.y < TOP_GAME_Y + this.hheight) {
        this.y = TOP_GAME_Y + this.hheight;
      } else if (this.y > BOTTOM_GAME_Y - this.hheight) {
        this.y = BOTTOM_GAME_Y - this.hheight;
      }
    }
    draw() {
      sclear();
      stile(TILEMAP, 0, 0, 1, 2);
      sorigin(4, 8);
      sdraw(this.x, this.y);
    }
  }
  class Ball extends Entity {
    constructor(size) {
      super(size, size);
      this.direction = { x: 0, y: 0 };
      this.speed = 0;
    }
    // Informations sent to AIs
    get state() {
      return {
        x: this.x,
        y: this.y
      };
    }
    get radius() {
      return this.hwidth;
    }
    // Update ball position and check collisions with screen bounds
    update(delta) {
      this.x += this.direction.x * this.speed * delta;
      this.y += this.direction.y * this.speed * delta;
      if (this.y < TOP_GAME_Y + this.hheight) {
        this.y = TOP_GAME_Y + this.hheight;
        this.direction.y *= -1;
      } else if (this.y > BOTTOM_GAME_Y - this.hheight) {
        this.y = BOTTOM_GAME_Y - this.hheight;
        this.direction.y *= -1;
      }
    }
    draw() {
      sclear();
      stile(TILEMAP, 1, 0, 1, 1);
      sorigin(4, 4);
      sdraw(this.x, this.y);
    }
  }
  function ballIntercept(ball2, rect, nx, ny) {
    let pt;
    if (nx < 0) {
      pt = intercept(
        ball2.x,
        ball2.y,
        ball2.x + nx,
        ball2.y + ny,
        rect.right + ball2.radius,
        rect.top - ball2.radius,
        rect.right + ball2.radius,
        rect.bottom + ball2.radius,
        "right"
      );
    } else if (nx > 0) {
      pt = intercept(
        ball2.x,
        ball2.y,
        ball2.x + nx,
        ball2.y + ny,
        rect.left - ball2.radius,
        rect.top - ball2.radius,
        rect.left - ball2.radius,
        rect.bottom + ball2.radius,
        "left"
      );
    }
    if (!pt) {
      if (ny < 0) {
        pt = intercept(
          ball2.x,
          ball2.y,
          ball2.x + nx,
          ball2.y + ny,
          rect.left - ball2.radius,
          rect.bottom + ball2.radius,
          rect.right + ball2.radius,
          rect.bottom + ball2.radius,
          "bottom"
        );
      }
      if (ny > 0) {
        pt = intercept(
          ball2.x,
          ball2.y,
          ball2.x + nx,
          ball2.y + ny,
          rect.left - ball2.radius,
          rect.top - ball2.radius,
          rect.right + ball2.radius,
          rect.top - ball2.radius,
          "top"
        );
      }
    }
    return pt;
  }
  function intercept(x1, y1, x2, y2, x3, y3, x4, y4, d) {
    var denom = (y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1);
    if (denom != 0) {
      var ua = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / denom;
      if (ua >= 0 && ua <= 1) {
        var ub = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / denom;
        if (ub >= 0 && ub <= 1) {
          var x = x1 + ua * (x2 - x1);
          var y = y1 + ua * (y2 - y1);
          return { x, y, d };
        }
      }
    }
    return null;
  }
  class PlayerController {
    constructor(pid) {
      this._pid = pid;
      this.score = 0;
    }
    get pid() {
      return this._pid;
    }
    get label() {
      return "human";
    }
    sendState(val) {
      state(this._pid, val);
    }
    inputs() {
      return {
        left: btn(this._pid, BLEFT),
        right: btn(this._pid, BRIGHT),
        up: btn(this._pid, BUP),
        down: btn(this._pid, BDOWN)
      };
    }
  }
  class AIController extends PlayerController {
    constructor(pid) {
      super(pid);
      this._inputs = {};
      this._prediction = void 0;
      this._level = AI_LEVEL_MEDIUM;
    }
    get label() {
      return "ai";
    }
    sendState(val) {
      state(this.pid, val);
    }
    inputs() {
      if (this.isBound) {
        return super.inputs();
      }
      return this._inputs;
    }
    _predict(bar, ball2, delta) {
      if (this._prediction && this._prediction.dX * ball2.direction.x > 0 && this._prediction.dY * ball2.direction.y > 0 && this._prediction.since < AI_LEVELS[this._level].reaction) {
        this._prediction.since += delta;
        return;
      }
      const pt = ballIntercept(
        ball2,
        { left: bar.left, right: bar.right, top: -1e4, bottom: 1e4 },
        ball2.direction.x * SWIDTH,
        ball2.direction.y * SWIDTH
      );
      if (pt) {
        this._prediction = {
          dX: ball2.direction.x,
          dY: ball2.direction.y,
          y: pt.y,
          since: 0
        };
        const closeness = (ball2.direction.x < 0 ? ball2.x - bar.right : bar.left - ball2.x) / SWIDTH;
        const error = AI_LEVELS[this._level].error * closeness;
        this._prediction.y = this._prediction.y + (Math.random() * 2 - 1) * error;
      } else {
        this._prediction = void 0;
        return;
      }
    }
    update(bar, ball2, delta) {
      this._inputs.up = false;
      this._inputs.down = false;
      if (ball2.x < bar.x && ball2.direction.x < 0 || ball2.x > bar.x && ball2.direction.x > 0) {
        return;
      }
      this._predict(bar, ball2, delta);
      if (this._prediction) {
        if (this._prediction.y < bar.y - bar.height * BAR_AI_THRESHOLD) {
          this._inputs.up = true;
          this._inputs.down = false;
        } else if (this._prediction.y > bar.y + bar.height * BAR_AI_THRESHOLD) {
          this._inputs.up = false;
          this._inputs.down = true;
        }
      }
    }
  }
  const playerController = new PlayerController(P1);
  const aiController = new AIController(P2);
  const bars = {
    left: new Bar(playerController, BAR_WIDTH, BAR_HEIGHT),
    right: new Bar(aiController, BAR_WIDTH, BAR_HEIGHT)
  };
  const ball = new Ball(BALL_SIZE);
  function reset() {
    bars.left.x = SWIDTH * BAR_X_OFFSET;
    bars.left.y = HSHEIGHT;
    bars.right.x = SWIDTH - SWIDTH * BAR_X_OFFSET;
    bars.right.y = HSHEIGHT;
    ball.x = HSWIDTH;
    ball.y = HSHEIGHT;
    const angle = BALL_ANGLES[floor(Math.random() * BALL_ANGLES.length)] * Math.PI / 180;
    ball.direction.x = cos(angle);
    ball.direction.y = sin(angle);
    ball.speed = BALL_SPEED;
  }
  function checkCollision(bar, ball2) {
    const pt = ballIntercept(
      ball2,
      bar,
      ball2.direction.x * ball2.speed,
      ball2.direction.y * ball2.speed
    );
    if (!pt) {
      return;
    }
    switch (pt.d) {
      case "left":
      case "right":
        ball2.x = pt.x;
        ball2.direction.x *= -1;
        break;
      case "top":
      case "bottom":
        ball2.y = pt.y;
        ball2.direction.y *= -1;
        break;
    }
    ball2.speed *= BALL_ACCELERATION;
  }
  function update(deltaTime) {
    aiController.update(bars.right, ball, deltaTime);
    bars.left.update(deltaTime);
    bars.right.update(deltaTime);
    ball.update(deltaTime);
    if (ball.direction.x < 0) {
      checkCollision(bars.left, ball);
    } else {
      checkCollision(bars.right, ball);
    }
    if (ball.x < 0 || ball.x > SWIDTH) {
      if (ball.x < 0) {
        aiController.score = min(aiController.score + 1, MAX_SCORE);
      } else {
        playerController.score = min(playerController.score + 1, MAX_SCORE);
      }
      reset();
    }
  }
  function drawPlayerUI(controller) {
    const isLeft = controller.pid === P1;
    const label = controller.label.toUpperCase();
    falign(isLeft ? 0 : 1, 0);
    fdraw(
      FONT,
      isLeft ? `P1:${label}` : `${label}:P2`,
      isLeft ? 2 : SWIDTH - 1,
      2
    );
    falign(isLeft ? 1 : 0, 0);
    fdraw(FONT, controller.score.toString(), HSWIDTH + (isLeft ? -2 : 2), 2);
  }
  function draw() {
    clear(COLOR_LIGHT);
    camera(HSWIDTH, HSHEIGHT);
    bars.left.draw();
    bars.right.draw();
    ball.draw();
    sclear();
    sscale(SWIDTH / 8, HEADER_HEIGHT / 8);
    stile(TILEMAP, 2, 1, 1, 1);
    sdraw(0, 0);
    sdraw(0, SHEIGHT - HEADER_HEIGHT);
    fclear();
    fcolor(COLOR_MEDIUM);
    falign(0.5, 0);
    fdraw(FONT, "-", HSWIDTH, 2);
    drawPlayerUI(playerController);
    drawPlayerUI(aiController);
  }
  reset();
  function tick(deltaTime) {
    update(deltaTime);
    draw();
  }
  function getStateForAgent() {
    return {
      bars: [bars.left.state, bars.right.state],
      ball: ball.state
    };
  }
  exports2.getStateForAgent = getStateForAgent;
  exports2.tick = tick;
  Object.defineProperty(exports2, Symbol.toStringTag, { value: "Module" });
});
