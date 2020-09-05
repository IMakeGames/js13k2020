function genHb(x,y,w,h){
    return{
        mag: 0,
        ang: 0,
        x: x,
        y: y,
        w: w,
        h: h,
        move(){
            let t = this;
            let xVar = Math.cos(t.ang)*t.mag;
            let yVar = Math.sin(t.ang)*t.mag;
            let a = {...t}, b = {...t};
            a.x += xVar - w/2;
            b.y += yVar - h/2;
            if(a.x > 10 && a.x+t.w < 990){
                t.x += xVar;
            }
            if(b.y > 10 && b.y+t.h < 990){
                t.y += yVar;
            }
        },
        //TODO: Chekc if necesarry to keep this function
        checkColission: function(hb2){
            var t = this;
            if(t.y + t.h <= hb2.y){
                return false;
            }
            if(t.y >= hb2.y + hb2.h){
                return false;
            }
            if(t.x + t.w <= hb2.x){
                return false;
            }
            return t.x < hb2.x + hb2.w;
        }
    }
}

function genMuncher(x,y){
    return {
        hb: genHb(x,y,30,30),
        food: null,
        state: "idle",
        eatingFrameConter: 0,
        frameCounter: 0,
        update(){
            let t = this;
            let fillText = "";
            if(t.frameCounter > 0)t.frameCounter--;
            let playerDistance = getDist(t.hb,playa.hb);
            t.hb.mag -= t.hb.mag*mouseAcc/(maxVel*0.8);
            ctx.fillStyle = 'orange';
            ctx.font = '40px Extrabold sans-serif';
            switch(t.state){
                case "idle":
                    if(t.frameCounter > 0){
                        fillText = "?";
                    }
                    if(playerDistance.dist < 100){
                        t.changeState("attack");
                    }
                    break;
                case "attack":
                    if(t.frameCounter > 0){
                        fillText = "!";
                    }
                    if(t.frameCounter < 15){
                        t.hb.mag -= mouseAcc;
                        t.hb.ang = playerDistance.angle;
                        if(playerDistance.dist > 200){
                            t.changeState("idle");
                        }
                    }
                    break;
                case "eating":
                    if(t.frameCounter > 0){
                        fillText = "|:O";
                    }else{
                        let foodDist = getDist(t.hb,t.food.hb);
                        if(foodDist.dist > 30){
                            t.hb.x -= foodDist.normalX;
                            t.hb.y -= foodDist.normalY;
                        }else{
                            if(!t.eatingFrameCounter){
                                t.eatingFrameCounter = 180;
                            }else{
                                t.eatingFrameCounter--;
                                if(!t.eatingFrameCounter){
                                    t.changeState("sleep");
                                    t.food.destroy();
                                    t.food = null;
                                }
                            }
                           fillText="CHOMP";
                        }
                    }
                    break;
                case "sleep":
                    fillText = "Z"
                    break;
                case "cooldown":
                    if(!t.frameCounter){
                        t.state = "attack";
                    }
            }
            let impactDist = (playa.hb.w + t.hb.w)/2;
            if(playerDistance.dist <= impactDist){
                playa.impact(playerDistance.angle);
                if(t.state != "eating" && t.state !="sleeping"){
                    t.hb.mag = 3;
                    this.changeState("cooldown");
                }
            }
            t.hb.move();
            ctx.fillText(fillText, t.hb.x - t.hb.w/2 + 10, t.hb.y - t.hb.h/2 - 10);
            ctx.fillRect(t.hb.x - t.hb.w/2,t.hb.y - t.hb.w/2,t.hb.w,t.hb.h);
            // ctx.strokeStyle = 'red';
            // ctx.strokeRect(t.hb.x - 1,t.hb.y - 1,1,1);
            // ctx.beginPath();
            // ctx.arc(t.hb.x, t.hb.y, holdRadius,0, 2 * Math.PI, false);
            // ctx.lineWidth = 1;
            // ctx.strokeStyle = 'purple';
            // ctx.stroke();
        },
        triggerFood(link){
            let t = this;
            if(t.state == "idle" && !t.frameCounter){
                t.food = link;
                t.changeState("eating");
            }
        },
        changeState(state){
            let t = this;
            t.frameCounter = state == "cooldown" ? 30 : 45;
            t.state = state;
        }
    }
}

var getDist = (hb1, hb2) => {
    //TODO elminite unused properties from return object.
    let xdiff = hb1.x - hb2.x;
    let ydiff = hb1.y - hb2.y;
    let dist = Math.hypot(xdiff, ydiff);
    let scalDiff = (10 - dist) / dist;
    let angle = Math.atan2(ydiff,xdiff) || 0;
    scalDiff = scalDiff > 0 || isNaN(scalDiff) ? 0 : scalDiff;
    return {
        dist: dist,
        angle: angle,
        translateX: xdiff * 0.5 * scalDiff,
        translateY: ydiff * 0.5 * scalDiff,
        normalX: xdiff/dist,
        normalY: ydiff/dist
    };
}

var genHole = (x,y,w,h)=>{
    let timeBeforeFall = 50;
    return {
        hb: genHb(x,y,w,h),
        timerStamp: 0,
        update(){
            let t = this;
            let playaX = playa.hb.x - playa.hb.w/2;
            let playaY = playa.hb.y - playa.hb.h/2;
            if(playaX >= t.hb.x && playaX+playa.hb.w <= t.hb.x + t.hb.w && playaY >= t.hb.y && playaY+playa.hb.h <= t.hb.y + t.hb.h){
                if(!t.timerStamp){
                    t.timerStamp = Date.now();
                }else if(Date.now() - t.timerStamp >= timeBeforeFall && playa.state != "falling"){
                    playa.triggerFall();
                }
            }else{
                t.timerStamp = 0;
            }
            ctx.fillStyle = "black"
            ctx.fillRect(t.hb.x,t.hb.y ,t.hb.w,t.hb.h);
        }
    }
}