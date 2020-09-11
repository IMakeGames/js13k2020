var PLAYER_WIDTH = 20;
var PLAYER_HEIGHT = 20;
var HOLD_RADIUS = 30;
var AFTER_DASH_CD = 10;
var TOTAL_DASH_CD = 50;
var TOTAL_DASH_FRAMES = 10;
function Player(initX, initY){
    let t = this;
    t.setVals(initX, initY, PLAYER_WIDTH, PLAYER_HEIGHT);
    t.dashFrames = 0;
    t.dashCoolDown = 0;
    t.state = "normal";
    t.animState = "idle";
    t.frameCounter = 0;
    t.direction = 0;
    t.health = 3;
    t.rope = null;
    t.animation = new Anim({
        "walking": genAnim([3, 4, 5, 9, 10, 11, 15], 60),
        "idle": genAnim([3, 16, 3, 3], 240),
        "falling": genAnim([3], 180),
        "recoil": genAnim([3], 180)
    },4,20, 22);
    t.update = ()=>{
        let scale = 1;
        let reSpawnPos = 0;
        let animSpd = 1;
        let holdPoint = null;
        if(!t.frameCounter) {
            if (RESOLVE_SHORT_CLICK && !t.dashFrames) {
                if (t.rope) {
                    if (soc = stage.sockets.find(socket => t.getDist({x: socket.conPt[0], y: socket.conPt[1]}).dist < 50 && !socket.rope)) {
                        t.rope.attach(soc, soc.conPt);
                    } else {
                        t.rope.detach();
                    }
                } else if (rop = stage.ropes.find(rope => t.getDist(rope).dist < 50)) {
                    //Conditions: must be close to the mouse pos && not already attached to a socket
                    if (rop.getDist(mousePos).dist < 20 && rop.color != colorRed){
                        rop.attach(t, rop);
                    }
                } else if (!t.dashCoolDown && (Date.now() - lastMouseUp < 270)) {
                    let distFromMouse = t.getDist(mousePos);
                    t.ang = distFromMouse.angle - Math.PI;
                    t.dashFrames = TOTAL_DASH_FRAMES;
                }
            }else{
                let xDiff = 0;
                //No negative magnitudes. If magnitude is negative, angle is reversed and magnitude is absoluted
                if (t.mag < -1) {
                    t.mag *= -1;
                    t.ang = t.ang - Math.PI;
                }
                //Friction is proportional to velocity
                t.mag -= t.dashFrames ? t.mag * dashAcc / dashMaxVel : t.mag * mouseAcc / maxVel;

                if (!t.dashFrames && t.dashCoolDown < (TOTAL_DASH_CD - AFTER_DASH_CD) && isMousePressed) {
                    //If not dashing, not on after-dash cd and if mouse is pressed, it moves towards mouse at
                    //magnitude relative to distance from mouse
                    xDiff = t.cX() - mousePos.x;
                    let mouseDist = t.getDist(mousePos);
                    t.mag += mouseDist.dist > 100 ? mouseAcc : (mouseDist.dist / 100) * mouseAcc;
                    t.ang = mouseDist.angle - Math.PI;
                }
                if (t.dashFrames) {
                    //if dashing, it dashes
                    t.mag += dashAcc;
                }
                if (t.rope) {
                    holdPoint = t.getHoldPoint();
                    t.rope.update(holdPoint);
                }
                t.move();
                if(xDiff > t.w/2){
                    t.direction = 1;
                }else if(xDiff < -t.w/2){
                    t.direction = 0;
                }
                if(t.mag > 0.2){
                    t.animState = "walking";
                    animSpd = t.mag/maxVel;
                }else{
                    t.animState = "idle";
                    if(t.animation.anim["idle"].counter == 0){
                        t.direction = Math.abs(t.direction - 1);
                    }
                }
            }
            //ResolveShortClick must always be falsed even if action is not taken
            RESOLVE_SHORT_CLICK = false;

            if (t.dashFrames) {
                t.dashFrames--;
                if (!t.dashFrames) {
                    t.dashCoolDown = TOTAL_DASH_CD;
                }
            }
            t.checkFall();
        }else{
            if(t.frameCounter >= FALL_FRAMES_HALVED){
                scale = (t.frameCounter - FALL_FRAMES_HALVED)/FALL_FRAMES_HALVED;

            }else{
                t.goToSpawn();
                reSpawnPos = t.frameCounter/FALL_FRAMES_HALVED;
            }
            t.frameCounter--;
            t.animState = "falling";
            if(!t.frameCounter) t.state = "normal";
        }
        if (t.dashCoolDown) {
            t.dashCoolDown--;
        }
        if(t.rope && holdPoint){
            ctx.save();
            ctx.scale(1, 1);
            ctx.drawImage(spriteSheet, 110, 34, SPRITE_WIDTH, SPRITE_HEIGHT, holdPoint.x - SPRITE_WIDTH/2, holdPoint.y  - SPRITE_HEIGHT/2, SPRITE_WIDTH, SPRITE_HEIGHT);
            ctx.restore();
        }
        t.animation.animate(t.x - t.w *scale/ 2, t.y - t.h * scale / 2 - reSpawnPos * t.y, t.animState, scale, t.direction, animSpd);
        if(debugMode){
            ctx.lineWidth = 1;
            ctx.strokeStyle = 'orange';
            ctx.strokeRect(t.x,t.y - reSpawnPos*t.y,t.w*scale,t.h*scale);
            ctx.strokeStyle = 'red';
            ctx.strokeRect(t.cX(),t.cY() - reSpawnPos*t.cY(), 1,1);
            ctx.beginPath();
            ctx.arc(t.cX(), t.cY() - reSpawnPos*t.cY(), HOLD_RADIUS,0, 2 * Math.PI, false);
            ctx.strokeStyle = 'purple';
            ctx.stroke();
        }
    }
    t.getHoldPoint = ()=>{
        let childDist = t.getDist(t.rope);
        return {x: t.cX() - childDist.normalX * HOLD_RADIUS, y: t.cY() - childDist.normalY * HOLD_RADIUS}
    }
    t.impact = (enemyAngle) => {
        t.deductHealth();
        t.ang = enemyAngle - Math.PI;
        t.dashFrames = TOTAL_DASH_FRAMES/2;
    }
    t.triggerFall = () => {
        t.state = "falling"
        t.deductHealth();
        t.dashFrames = 0;
        if(t.rope){
            t.rope.detach();
            t.rope = null;
        }
        t.frameCounter = FALL_FRAMES_HALVED*2;
        t.mag = 0;
    }
    t.deductHealth = ()=>{
        t.health--;
        if(t.health < 1){
            gameState = "game_over";
        }
    }
}

Player.prototype = Hitbox();