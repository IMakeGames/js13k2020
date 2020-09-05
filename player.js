function genPj(initX, initY){
    //TODO: pass numbers directly when quantities have been decided.
    let holdRadius = 22;
    let afterDashMovCd = 10;
    let totalDashCd = 50;
    let totalDashFrames = 10;
    let stretchMinDist = 6;
    let stretchMaxDist = 10;
    let fallFramesHalved = 30;
    return {
        dashFrames: 0,
        dashCoolDown: 0,
        state: "normal",
        frameCounter: 0,
        health: 3,
        hb: genHb(initX, initY, 20, 20),
        rope: null,
        update(){
            let t = this;
            let scale = 1;
            let reSpawnPos = 0;
            if(!t.frameCounter) {
                //No negative magnitudes. If magnitude is negative, angle is reversed and magnitude is absoluted
                if (t.hb.mag < -1) {
                    t.hb.mag *= -1;
                    t.hb.ang = t.hb.ang - Math.PI;
                }
                t.hb.mag -= t.dashFrames ? t.hb.mag * dashAcc / dashMaxVel : t.hb.mag * mouseAcc / maxVel;
                if (!t.dashFrames && t.dashCoolDown < (totalDashCd - afterDashMovCd) && isMousePressed) {
                    let mouseDist = getDist(mousePos, t.hb);
                    t.hb.mag += mouseDist.dist > 100 ? mouseAcc : (mouseDist.dist / 100) * mouseAcc;
                    t.hb.ang = mouseDist.angle;
                }
                if (t.dashFrames) {
                    t.hb.mag += dashAcc;
                }
                if (t.rope) {
                    let holdPoint = t.getHoldPoint();
                    let realChildDist = getDist(holdPoint, t.rope.hb);
                    let newM = realChildDist.dist > stretchMinDist ? (realChildDist.dist - stretchMinDist) * maxVel / stretchMaxDist : 0;
                    let xvecResult = Math.cos(t.hb.ang) * t.hb.mag - Math.cos(realChildDist.angle) * newM;
                    let yvecResult = Math.sin(t.hb.ang) * t.hb.mag - Math.sin(realChildDist.angle) * newM;
                    let newAng = Math.atan2(yvecResult, xvecResult) || 0;
                    t.hb.ang = newAng;
                    t.hb.mag -= newM;
                    if (t.hb.mag < 0) t.hb.mag *= -4;
                    t.rope.update(holdPoint);
                }
                t.hb.move();
                if (resolveShortClick && !t.dashFrames) {
                    if (t.rope) {
                        if (soc = stage.sockets.find(socket => getDist(t.hb, {
                            x: socket.conPt[0],
                            y: socket.conPt[1]
                        }).dist < 30 && !socket.rope)) {
                            t.rope.attach(soc, soc.conPt);
                        } else {
                            t.rope.attached = null;
                            t.rope = null;
                        }
                        t.rope = null;
                    } else if (rop = stage.ropes.find(rope => getDist(t.hb, rope.hb).dist < 50)) {
                        //Conditions: must be close to the mouse pos && not already attached to a socket
                        if (getDist(rop.hb, mousePos).dist < 15 && !rop.attached){
                            rop.attach(t, rop.hb);
                        }
                    } else if (!t.dashCoolDown && (Date.now() - lastMouseUp < 270)) {
                        let distFromMouse = getDist(mousePos, t.hb);
                        t.hb.ang = distFromMouse.angle;
                        t.dashFrames = totalDashFrames;
                    }
                }
                //ResolveShortClick must always be falsed even if action is not taken
                resolveShortClick = false;

                if (t.dashFrames) {
                    t.dashFrames--;
                    if (!t.dashFrames) {
                        t.dashCoolDown = totalDashCd;
                    }
                }
            }else{
                if(t.frameCounter >= fallFramesHalved){
                    scale = (t.frameCounter - fallFramesHalved)/fallFramesHalved;

                }else{
                    t.goToSpawn();
                    reSpawnPos = t.frameCounter/fallFramesHalved;
                }
                t.frameCounter--;
                if(!t.frameCounter) t.state = "normal";
            }
            if (t.dashCoolDown) t.dashCoolDown--;
            ctx.lineWidth = 1;
            ctx.fillStyle = 'blue';
            ctx.fillRect(t.hb.x - t.hb.w/2,(t.hb.y - t.hb.w/2) - reSpawnPos*(t.hb.y - t.hb.h/2),t.hb.w*scale,t.hb.h*scale);
            ctx.strokeStyle = 'red';
            ctx.strokeRect(t.hb.x - 1,(t.hb.y - 1) - reSpawnPos*(t.hb.y - 1),1,1);
            ctx.beginPath();
            ctx.arc(t.hb.x, t.hb.y - reSpawnPos*t.hb.y, holdRadius,0, 2 * Math.PI, false);
            ctx.strokeStyle = 'purple';
            ctx.stroke();
        },
        getHoldPoint(){
            let t = this;
            let childDist = getDist(t.hb, t.rope.hb);
            return {x: t.hb.x - childDist.normalX * holdRadius, y: t.hb.y - childDist.normalY * holdRadius}
        },
        impact(enemyAngle){
            let t = this;
            t.deductHealth();
            t.hb.ang = enemyAngle - Math.PI;
            t.dashFrames = totalDashFrames/2;
        },
        triggerFall(){
            let t = this;
            t.state = "falling"
            t.deductHealth();
            t.frameCounter = fallFramesHalved*2;
            t.hb.mag = 0;
        },
        goToSpawn(){
            let t = this;
            t.hb.x = spawnPoint.x;
            t.hb.y = spawnPoint.y;
        },
        deductHealth(){
            let t = this;
            t.health--;
            if(t.health < 1){
                gameState = "game_over";
            }
        }
    }
}