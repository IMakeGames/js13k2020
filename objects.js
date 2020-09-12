
var TIME_BEFORE_FALL = 50;
var FALL_FRAMES_HALVED = 30;

function Hitbox(x, y, w, h) {
    return {
        mag: 0,
        ang: 0,
        x: x,
        y: y,
        w: w,
        h: h,
        spawnPoint: null,
        fallTimer: 0,
        cX() {
            return this.x + this.w / 2
        },
        cY() {
            return this.y + this.h / 2
        },
        center() {
            let t = this;
            return {x: t.cX(), y: t.cY()}
        },
        move(varX, varY) {
            let t = this;
            let xVar = varX ? varX : Math.cos(t.ang) * t.mag;
            let yVar = varY ? varY : Math.sin(t.ang) * t.mag;
            let a = Hitbox(t.x, t.y, t.w, t.h);
            let b = Hitbox(t.x, t.y, t.w, t.h);
            a.x += xVar;
            b.y += yVar;
            if (a.x > 10 && a.x + t.w < 990) {
                if (stage.solidBodies.filter(soc => a.checkColission(soc)).length < 1) {
                    t.x += xVar;
                }
                // t.x += xVar;
            }
            if (b.y > 10 && b.y + t.h < 990) {
                if (stage.solidBodies.filter(soc => b.checkColission(soc)).length < 1) {
                    t.y += yVar;
                }
                // t.y += yVar;
            }
        },
        getDist(hb2, constraint = 0) {
            //TODO elminite unused properties from return object.
            let t = this;
            let xdiff = t.cX() - hb2.x;
            let ydiff = t.cY() - hb2.y;
            let dist = Math.hypot(xdiff, ydiff);
            let scalDiff = (constraint - dist) / dist;
            let angle = Math.atan2(ydiff, xdiff) || 0;
            scalDiff = scalDiff > 0 || isNaN(scalDiff) ? 0 : scalDiff;
            return {
                dist: dist,
                angle: angle,
                translateX: xdiff * 0.5 * scalDiff,
                translateY: ydiff * 0.5 * scalDiff,
                normalX: xdiff / dist,
                normalY: ydiff / dist
            }
        },
        //TODO: Chekc if necesarry to keep this function
        checkColission(hb2) {
            let t = this;
            if (t.y + t.h <= hb2.y) {
                return false;
            }
            if (t.y >= hb2.y + hb2.h) {
                return false;
            }
            if (t.x + t.w <= hb2.x) {
                return false;
            }
            return t.x < hb2.x + hb2.w;
        },
        checkFall() {
            let t = this;
            if (stage.holes && t.state != "falling") {
                let inFallRange = false;
                let holes = stage.getHoles();
                for (let i = 0; i < holes.length; i++) {
                    if (t.x >= holes[i].x && t.x + t.w <= holes[i].x + holes[i].w && t.y >= holes[i].y && t.y + t.h <= holes[i].y + holes[i].h) {
                        inFallRange = true;
                    }
                }
                if (inFallRange) {
                    if (!t.fallTimer) {
                        t.fallTimer = Date.now();
                    } else if (Date.now() - t.fallTimer >= TIME_BEFORE_FALL) {
                        t.triggerFall();
                    }
                } else {
                    t.fallTimer = 0;
                }
            }
        },
        goToSpawn() {
            let t = this;
            t.x = t.spawnPoint.x;
            t.y = t.spawnPoint.y;
        },
        setVals(x, y, w, h) {
            let t = this;
            t.spawnPoint = {x: x, y: y};
            t.x = x;
            t.y = y;
            t.w = w;
            t.h = h;
        }
    }
}

var BYTER_WIDTH = 30;
var BYTER_HEIGHT = 30;

function Byter(x, y, type = "sleeper") {
    let t = this;
    t.food = null;
    t.state = "idle";
    t.animState = "idle";
    // 1 = right; -1 = left
    t.direction = 0;
    t.type = type;
    if(type == "sleeper"){
        t.color = colorYellow;
    }else if(type == "active"){
        t.color = colorRed;
    }
    t.eatingFrameConter = 0;
    t.frameCounter = 0;
    t.scale =
        t.setVals(x, y, BYTER_WIDTH, BYTER_HEIGHT);
    t.animation = new Anim({
        "exp": genAnim([0], 180),
        "walking": genAnim([0, 12], 60),
        "idle": genAnim([0, 1, 0], 140),
        "attack": genAnim([6, 7, 8], 10,1),
        "eating": genAnim([12, 13, 14], 10,1),
        "cd": genAnim([6], 180),
        "falling": genAnim([6], 180),
        "sleep": genAnim([2], 180)
    },3,4, 0, t.color);
    t.update = () => {
        let scale = 1;
        let reSpawnPos = 0;
        let fillText = "";
        if (t.frameCounter > 0) t.frameCounter--;
        let playerDistance = t.getDist(PLAYER.center());
        t.mag -= t.mag * mouseAcc / (maxVel * 0.8);
        ctx.fillStyle = 'orange';
        ctx.font = '40px Extrabold sans-serif';
        let xDiff = 0;
        switch (t.state) {
            case "idle":
                let spawnDist = t.getDist(t.spawnPoint);
                if (t.frameCounter > 0) {
                    t.animState = "exp";
                    fillText = "?";
                } else if (spawnDist.dist > 1) {
                    xDiff = t.cX() - t.spawnPoint.x;
                    fillText = "...";
                    t.animState = "walking";
                    t.x -= spawnDist.normalX * 2;
                    t.y -= spawnDist.normalY * 2;
                } else {
                    t.animState = "idle";
                    if(t.animation.anim["idle"].counter == 0){
                        t.direction = Math.abs(t.direction - 1);
                    }
                }
                if (playerDistance.dist < 150) {
                    t.changeState("attack");
                }
                break;
            case "attack":
                if (t.frameCounter > 0) {
                    fillText = "!";
                }
                if (t.frameCounter >= 15) {
                    t.animState = "exp";
                } else {
                    xDiff = t.cX() - PLAYER.cX();
                    t.animState = "attack";
                    t.mag -= mouseAcc;
                    t.ang = playerDistance.angle;
                    if (playerDistance.dist > 250) {
                        t.changeState("idle");
                    }
                }
                break;
            case "eating":
                if (t.frameCounter > 0) {
                    fillText = "🍗";
                    t.animState = "exp"
                } else {
                    t.food = t.getClosestLink(t.food, t.food.getParent());
                    let foodDist = t.getDist(t.food);
                    if (foodDist.dist > 30) {
                        xDiff = t.cX() - t.food.x;
                        t.animState = "walking";
                        t.x -= foodDist.normalX;
                        t.y -= foodDist.normalY;
                    } else {
                        t.animState = "eating"
                        if (!t.eatingFrameCounter) {
                            t.eatingFrameCounter = 180;
                        } else {
                            t.eatingFrameCounter--;
                            if (!t.eatingFrameCounter) {
                                if (t.type == "sleeper") {
                                    t.changeState("sleep");
                                } else {
                                    t.changeState("idle");
                                }
                                t.food.consume();
                                t.food = null;
                            }
                        }
                        fillText = "CHOMP";
                    }
                }
                break;
            case "sleep":
                fillText = "Z"
                t.animState = "sleep"
                break;
            case "cooldown":
                t.animState = "cd"
                if (!t.frameCounter) {
                    t.state = "attack";
                }
                break;
            case "falling":
                t.animState = "falling";
                if (t.frameCounter >= FALL_FRAMES_HALVED) {
                    scale = (t.frameCounter - FALL_FRAMES_HALVED) / FALL_FRAMES_HALVED;
                } else {
                    t.goToSpawn();
                    reSpawnPos = t.frameCounter / FALL_FRAMES_HALVED;
                }
                if (!t.frameCounter) t.changeState("idle");
        }
        t.checkFall();
        let impactDist = (PLAYER.w + t.w) / 2;
        if (PLAYER.state != "falling" && playerDistance.dist <= impactDist) {
            PLAYER.impact(playerDistance.angle);
            if (t.state != "eating" && t.state != "sleeping") {
                t.mag = 3;
                t.changeState("cooldown");
            }
        }
        t.move();
        ctx.fillText(fillText, t.x - t.w + 10, t.y - t.h / 2 - 10);
        if(xDiff > t.w/2){
            t.direction = 1;
        }else if(xDiff < -t.w/2){
            t.direction = 0;
        }
        t.animation.animate(t.x - t.w *scale/ 2, t.y - t.h * scale / 2 - reSpawnPos * t.y, t.animState, scale, t.direction);

        if (debugMode) {
            ctx.strokeStyle = "rgb("+t.color+")";
            ctx.lineWidth = 2;
            ctx.strokeRect(t.x, t.y - reSpawnPos * t.y, t.w * scale, t.h * scale);
        }
    };
    t.triggerFood = (link) => {
        let t = this;
        if (t.state == "idle" && !t.frameCounter) {
            t.food = link;
            t.changeState("eating");
        }
    };
    t.getClosestLink = (food, el) => {
        let closest = food
        if (!el.child) {
            return closest;
        } else if (t.getDist(el.child).dist < t.getDist(closest).dist) {
            closest = el.child;
        }
        return t.getClosestLink(closest, el.child);
    }
    t.triggerFall = () => {
        t.changeState("falling");
    }
    t.changeState = (state) => {
        let t = this;
        if (state == "cooldown") {
            t.frameCounter = 30
        } else if (state == "falling") {
            t.frameCounter = FALL_FRAMES_HALVED * 2;
        } else {
            t.frameCounter = 45;
        }
        t.state = state;
    }
}

Byter.prototype = Hitbox();
var SPRITE_WIDTH = 22;
var SPRITE_HEIGHT = 17;

function Anim(anim, mult, xOffset, yOffset, color) {
    let t = this;
    t.anim = anim;
    t.spriteData = [];
    t.sSheet = SPRITE_SHEET;
    if(color){
        let hidden = document.createElement('canvas');
        hidden.width = 132;
        hidden.height = 51;
        let ctxHidden = hidden.getContext("2d");
        setNoSmoothing(ctxHidden)
        ctxHidden.clearRect(0, 0, 132, 51);
        ctxHidden.fillStyle = "rgba("+color+", 0.5)"
        ctxHidden.drawImage(SPRITE_SHEET,0,0);
        ctxHidden.globalCompositeOperation = "source-atop"
        ctxHidden.fillRect(0,0,132,51);
        t.sSheet = hidden;
    }
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 6; j++) {
            t.spriteData.push([SPRITE_WIDTH * j, SPRITE_HEIGHT * i]);
        }
    }

    for (key in t.anim) {
        let member = t.anim[key];
        let fraction = Math.round(member.duration / member.sprites.length);
        let div = fraction;
        let frameInd = 0;
        member.spriteArray = []
        for (let i = 0; i < member.duration; i++) {
            if (i > div) {
                frameInd++;
                div += fraction;
            }
            member.spriteArray.push(member.sprites[frameInd]);
        }
    }

    t.animate = (x, y, state, scl, direction, increment = 0) => {
        if(t.color){
            ctx.drawImage(t.sSheet,100,100);
        }
        let thisAnim = t.anim[state]
        let spriteDatum = t.spriteData[thisAnim.spriteArray[thisAnim.counter]]
        let scale = 1
        if (direction & 1) {
            scale = -1;
            x = -x - SPRITE_WIDTH * mult + xOffset;
        } else {
            x -= xOffset;
        }
        y -= yOffset;
        ctx.save();
        ctx.scale(scale, 1);
        ctx.drawImage(t.sSheet, spriteDatum[0], spriteDatum[1], SPRITE_WIDTH, SPRITE_HEIGHT, x, y, SPRITE_WIDTH * mult *scl, SPRITE_HEIGHT * mult *scl);
        ctx.restore();
        thisAnim.counter += Math.round(thisAnim.add + increment);
        if (thisAnim.counter >= thisAnim.duration) {
            if (thisAnim.reverse & 1) {
                thisAnim.add = -1;
                thisAnim.counter--;
            } else {
                thisAnim.counter = 0;
            }
        } else if (thisAnim.counter <= 0) {
            thisAnim.add = 1;
        }
    }
}

var genAnim = (sprites, duration, reverse = 0) => {
    return {
        sprites: sprites,
        duration: duration,
        counter: 0,
        reverse: reverse,
        yOffset: 0,
        add: 1
    }
}
