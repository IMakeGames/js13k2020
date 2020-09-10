var spriteSheet = new Image();
spriteSheet.src = "sprite.png";

function Hitbox(x,y,w,h){
    return{
        mag: 0,
        ang: 0,
        x: x,
        y: y,
        w: w,
        h: h,
        cX(){ return this.x + this.w/2},
        cY(){ return this.y + this.h/2},
        center(){
            let t = this;
            return {x: t.cX(), y: t.cY()}
        },
        move(){
            let t = this;
            let xVar = Math.cos(t.ang)*t.mag;
            let yVar = Math.sin(t.ang)*t.mag;
            let a = Hitbox(t.x,t.y,t.w,t.h);
            let b = Hitbox(t.x,t.y,t.w,t.h);
            a.x += xVar;
            b.y += yVar;
            if(a.x > 10 && a.x+t.w < 990){
                let collision = false;
                stage.sockets.forEach(function(socket){
                    if(a.checkColission(socket)){
                        collision = true;
                    }
                })
                if(!collision){
                    t.x += xVar;
                }
                // if(stage.sockets.filter(soc => soc.hb.checkColission(a)).length < 1){
                //     t.x += xVar;
                // }

            }
            if(b.y > 10 && b.y+t.h < 990){
                let collision = false;
                stage.sockets.forEach(function(socket){
                    if(b.checkColission(socket)){
                        collision = true;
                    }
                })
                if(!collision){
                    t.y += yVar;
                }
                // if(stage.sockets.filter(soc => soc.hb.checkColission(b)).length < 1){
                //     t.y += yVar;
                // }
            }
        },
        getDist(hb2,constraint = 0){
            //TODO elminite unused properties from return object.
            let t = this;
            let xdiff = t.cX() - hb2.x;
            let ydiff = t.cY() - hb2.y;
            let dist = Math.hypot(xdiff, ydiff);
            let scalDiff = (constraint - dist) / dist;
            let angle = Math.atan2(ydiff,xdiff) || 0;
            scalDiff = scalDiff > 0 || isNaN(scalDiff) ? 0 : scalDiff;
            return {
                dist: dist,
                angle: angle,
                translateX: xdiff * 0.5 * scalDiff,
                translateY: ydiff * 0.5 * scalDiff,
                normalX: xdiff/dist,
                normalY: ydiff/dist
            }
        },
        //TODO: Chekc if necesarry to keep this function
        checkColission(hb2){
            let t = this;
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
        },
        setVals(x,y,w,h){
            let t = this;
            t.x = x;
            t.y = y;
            t.w = w;
            t.h = h;
        }
    }
}
var BYTER_WIDTH = 30;
var BYTER_HEIGHT = 30;

function Byter(x,y){
    let t = this;
    t.food = null;
    t.state = "idle";
    t.eatingFrameConter =  0;
    t.frameCounter = 0;
    t.setVals(x,y,BYTER_WIDTH,BYTER_HEIGHT);

    t.update = ()=>{
        let fillText = "";
        if(t.frameCounter > 0)t.frameCounter--;
        let playerDistance = t.getDist(PLAYER.center());
        t.mag -= t.mag*mouseAcc/(maxVel*0.8);
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
                    t.mag -= mouseAcc;
                    t.ang = playerDistance.angle;
                    if(playerDistance.dist > 200){
                        t.changeState("idle");
                    }
                }
                break;
            case "eating":
                if(t.frameCounter > 0){
                    fillText = "🍗";
                }else{
                    let foodDist = t.getDist(t.food.center());
                    if(foodDist.dist > 30){
                        t.x -= foodDist.normalX;
                        t.y -= foodDist.normalY;
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
        let impactDist = (PLAYER.w + t.w)/2;
        if(playerDistance.dist <= impactDist){
            PLAYER.impact(playerDistance.angle);
            if(t.state != "eating" && t.state !="sleeping"){
                t.mag = 3;
                t.changeState("cooldown");
            }
        }
        t.move();
        ctx.fillText(fillText, t.x - t.w + 10, t.y - t.h/2 - 10);
        ctx.save();
        ctx.scale(-1, 1);
        ctx.drawImage(spriteSheet, 0,0,22,21,-t.x,t.y,44,42);
        ctx.restore();
        //ctx.fillRect(t.x,t.y,t.w,t.h);
        // ctx.strokeStyle = 'red';
        // ctx.strokeRect(t.hb.x - 1,t.hb.y - 1,1,1);
        // ctx.beginPath();
        // ctx.arc(t.hb.x, t.hb.y, holdRadius,0, 2 * Math.PI, false);
        // ctx.lineWidth = 1;
        // ctx.strokeStyle = 'purple';
        // ctx.stroke();
    };
    t.triggerFood = (link)=>{
        let t = this;
        if(t.state == "idle" && !t.frameCounter){
            t.food = link;
            t.changeState("eating");
        }
    };
    t.changeState = (state) =>{
        let t = this;
        t.frameCounter = state == "cooldown" ? 30 : 45;
        t.state = state;
    }
}
Byter.prototype = Hitbox();

var getNextWholeDivisor = (dividend, divisor) =>{
    if(dividend%divisor == 0){
        return divisor;
    }else{
        return getNextWholeDivisor(dividend,divisor - 1);
    }
}
