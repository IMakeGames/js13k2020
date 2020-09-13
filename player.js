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
    t.dashAfterImg = [];
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
                    let attachToSoc = false;
                    if (soc = stage.sockets.find(socket => t.getDist({x: socket.conPt[0], y: socket.conPt[1]}).dist < 50 && !socket.rope)) {
                        let conXdiff = t.cX() - soc.conPt[0];
                        let conYdiff = t.cY() - soc.conPt[1];
                        let betweenX = false;
                        let betweenY = false;
                        it(stage.ropes.length,(i)=>{
                            let el = t.getClosestLink(stage.ropes[i],stage.ropes[i]);
                            if(stage.ropes[i] !== t.rope && t.getDist(el).dist < 50){
                                let elXdiff = t.cX() - el.x;
                                let elYdiff = t.cY() - el.y;
                                if(
                                    (conXdiff > 0 && elXdiff > 0 && elXdiff < conXdiff) ||
                                    (conXdiff < 0 && elXdiff < 0 && elXdiff > conXdiff)
                                ){
                                    betweenX = true;
                                }
                                if(
                                    (conYdiff > 0 && elYdiff > 0 && elYdiff < conYdiff) ||
                                    (conYdiff < 0 && elYdiff < 0 && elYdiff > conYdiff)
                                ){
                                    betweenY = true;
                                }
                            }
                        });
                        if(soc.color === colorGray || soc.color === t.rope.color && !betweenX && !betweenY){
                            t.rope.attach(soc, soc.conPt);
                            attachToSoc = true;
                        }
                    }
                    if(!attachToSoc) {
                        t.rope.detach();
                    }
                } else if (rop = stage.ropes.find(rope => t.getDist(rope).dist < 50)) {
                    //Conditions: must be close to the mouse pos && not already attached to a socket
                    if (rop.getDist(mousePos).dist < 20 && rop.state != "destroy" && rop.color != colorRed){
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
                if(t.dashFrames%2 == 0){
                    let sheet = COLORED_SPRITE_SHEETS[SOLID_COLORS[t.dashFrames/2 - 1]];
                    t.dashAfterImg.push([sheet,t.x,t.y,10]);
                }
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
            ctx.drawImage(SPRITE_SHEET, 110, 34, SPRITE_WIDTH, SPRITE_HEIGHT, holdPoint.x - SPRITE_WIDTH/2, holdPoint.y  - SPRITE_HEIGHT/2, SPRITE_WIDTH*1.5, SPRITE_HEIGHT*1.5);
            ctx.restore();
        }
        let x, y;
        if(!t.direction){
            x = t.x + t.w + 8 - t.w * scale * 2;
            y = t.y + t.h + 8 - t.h * scale * 2;
        }else{
            x = t.x - t.w - 32 + t.w * scale * 2;
            y = t.y - t.h * scale * 2 + 27;
        }
        let byeMember = null
        it(t.dashAfterImg.length,(i)=>{
            let x = t.dashAfterImg[i][1] + Math.cos(t.ang) * t.mag;
            let y = t.dashAfterImg[i][2] + Math.sin(t.ang) * t.mag;
            let scale = 1;
            if (t.direction & 1) {
                scale = -1;
                x = -x - SPRITE_WIDTH * 4 + 20;
            } else {
                x -= 20;
            }
            y -= 22;
            ctx.save();
            ctx.scale(scale, 1);
            ctx.globalAlpha = t.dashAfterImg[i][3]/7;
            ctx.drawImage(t.dashAfterImg[i][0],88,17,22,17,x,y,22*4,17*4);
            ctx.restore();
            t.dashAfterImg[i][3]--;
            if(t.dashAfterImg[i][3] < 0){
                byeMember = t.dashAfterImg[i];
            }
        });
        if(byeMember){
            t.dashAfterImg = t.dashAfterImg.filter(img => img !==byeMember);
        }
        t.animation.animate(x, y - reSpawnPos * t.y, t.animState, scale, t.direction, animSpd);
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