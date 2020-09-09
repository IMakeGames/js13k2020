var PLAYER_WIDTH = 20;
var PLAYER_HEIGHT = 20;
var HOLD_RADIUS = 22;
var AFTER_DASH_CD = 10;
var TOTAL_DASH_CD = 50;
var TOTAL_DASH_FRAMES = 10;
var MIN_STRETCH_DIST = 6;
var MAX_STRETCH_DIST = 10;
var FALL_FRAMES_HALVED = 30;

function Player(initX, initY){
    let t = this;
    t.setVals(initX, initY, PLAYER_WIDTH, PLAYER_HEIGHT);
    t.dashFrames = 0;
    t.dashCoolDown = 0;
    t.state = "normal";
    t.frameCounter = 0;
    t.health = 3;
    t.rope = null;
    t.update = ()=>{
        let scale = 1;
        let reSpawnPos = 0;
        if(!t.frameCounter) {
            if (RESOLVE_SHORT_CLICK && !t.dashFrames) {
                if (t.rope) {
                    if (soc = stage.sockets.find(socket => t.getDist({x: socket.conPt[0], y: socket.conPt[1]}).dist < 50 && !socket.rope)) {
                        t.rope.attach(soc, soc.conPt);
                    } else {
                        t.rope.attached = null;
                        t.rope = null;
                    }
                    t.rope = null;
                } else if (rop = stage.ropes.find(rope => t.getDist(rope).dist < 50)) {
                    //Conditions: must be close to the mouse pos && not already attached to a socket
                    if (rop.getDist(mousePos).dist < 20 && !rop.attached){
                        rop.attach(t, mousePos);
                    }
                } else if (!t.dashCoolDown && (Date.now() - lastMouseUp < 270)) {
                    let distFromMouse = t.getDist(mousePos);
                    t.ang = distFromMouse.angle - Math.PI;
                    t.dashFrames = TOTAL_DASH_FRAMES;
                }
            }else{
                //No negative magnitudes. If magnitude is negative, angle is reversed and magnitude is absoluted
                if (t.mag < -1) {
                    t.mag *= -1;
                    t.ang = t.ang - Math.PI;
                }
                t.mag -= t.dashFrames ? t.mag * dashAcc / dashMaxVel : t.mag * mouseAcc / maxVel;
                if (!t.dashFrames && t.dashCoolDown < (TOTAL_DASH_CD - AFTER_DASH_CD) && isMousePressed) {
                    let mouseDist = t.getDist(mousePos);
                    t.mag += mouseDist.dist > 100 ? mouseAcc : (mouseDist.dist / 100) * mouseAcc;
                    t.ang = mouseDist.angle - Math.PI;
                }
                if (t.dashFrames) {
                    t.mag += dashAcc;
                }
                if (t.rope) {
                    let holdPoint = t.getHoldPoint();
                    let realChildDist = t.rope.getDist(holdPoint);
                    let newM = realChildDist.dist > MIN_STRETCH_DIST ? (realChildDist.dist - MIN_STRETCH_DIST) * maxVel / MAX_STRETCH_DIST : 0;
                    let xvecResult = Math.cos(t.ang) * t.mag - Math.cos(realChildDist.angle) * newM;
                    let yvecResult = Math.sin(t.ang) * t.mag - Math.sin(realChildDist.angle) * newM;
                    let newAng = Math.atan2(yvecResult, xvecResult) || 0;
                    t.ang = newAng;
                    t.mag -= newM;
                    if (t.mag < 0) t.mag *= -4;
                    ctx.fillStyle = "white"
                    ctx.font = '25px serif';
                    ctx.fillText("Hold point: x: "+holdPoint.x.toFixed(3)+" y: "+holdPoint.y.toFixed(3),75,850);
                    t.rope.update(holdPoint);
                }
                t.move();
            }
            //ResolveShortClick must always be falsed even if action is not taken
            RESOLVE_SHORT_CLICK = false;

            if (t.dashFrames) {
                t.dashFrames--;
                if (!t.dashFrames) {
                    t.dashCoolDown = TOTAL_DASH_CD;
                }
            }
        }else{
            if(t.frameCounter >= FALL_FRAMES_HALVED){
                scale = (t.frameCounter - FALL_FRAMES_HALVED)/FALL_FRAMES_HALVED;

            }else{
                t.goToSpawn();
                reSpawnPos = t.frameCounter/FALL_FRAMES_HALVED;
            }
            t.frameCounter--;
            if(!t.frameCounter) t.state = "normal";
        }
        if (t.dashCoolDown) t.dashCoolDown--;
        ctx.lineWidth = 1;
        ctx.fillStyle = 'blue';
        ctx.fillRect(t.x,t.y - reSpawnPos*t.y,t.w*scale,t.h*scale);
        ctx.strokeStyle = 'red';
        ctx.strokeRect(t.cX(),t.cY() - reSpawnPos*t.cY(), 1,1);
        ctx.beginPath();
        ctx.arc(t.cX(), t.cY() - reSpawnPos*t.cY(), HOLD_RADIUS,0, 2 * Math.PI, false);
        ctx.strokeStyle = 'purple';
        ctx.stroke();
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
        t.frameCounter = FALL_FRAMES_HALVED*2;
        t.mag = 0;
    }
    t.goToSpawn = ()=>{
        let t = this;
        t.x = spawnPoint.x;
        t.y = spawnPoint.y;
    }
    t.deductHealth = ()=>{
        t.health--;
        if(t.health < 1){
            gameState = "game_over";
        }
    }
}

Player.prototype = Hitbox();