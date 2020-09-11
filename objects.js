var spriteSheet = new Image();
spriteSheet.src = "sprite.png";
var TIME_BEFORE_FALL = 50;
var FALL_FRAMES_HALVED = 30;
function Hitbox(x,y,w,h){
    return{
        mag: 0,
        ang: 0,
        x: x,
        y: y,
        w: w,
        h: h,
        spawnPoint: null,
        fallTimer: 0,
        cX(){ return this.x + this.w/2},
        cY(){ return this.y + this.h/2},
        center(){
            let t = this;
            return {x: t.cX(), y: t.cY()}
        },
        move(varX, varY){
            let t = this;
            let xVar = varX ? varX : Math.cos(t.ang)*t.mag;
            let yVar = varY ? varY : Math.sin(t.ang)*t.mag;
            let a = Hitbox(t.x,t.y,t.w,t.h);
            let b = Hitbox(t.x,t.y,t.w,t.h);
            a.x += xVar;
            b.y += yVar;
            if(a.x > 10 && a.x+t.w < 990){
                if(stage.sockets.filter(soc => a.checkColission(soc)).length < 1){
                    t.x += xVar;
                }
                // t.x += xVar;

            }
            if(b.y > 10 && b.y+t.h < 990){
                if(stage.sockets.filter(soc => b.checkColission(soc)).length < 1){
                    t.y += yVar;
                }
                // t.y += yVar;
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
        checkFall(){
            let t = this;
            if(stage.holes && t.state != "falling") {
                let inFallRange = false;
                let holes = stage.holes.holes;
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
        goToSpawn (){
            let t = this;
            t.x = t.spawnPoint.x;
            t.y = t.spawnPoint.y;
        },
        setVals(x,y,w,h){
            let t = this;
            t.spawnPoint = {x:x, y: y};
            t.x = x;
            t.y = y;
            t.w = w;
            t.h = h;
        }
    }
}
var BYTER_WIDTH = 30;
var BYTER_HEIGHT = 30;

function Byter(x,y, type = "sleeper"){
    let t = this;
    t.food = null;
    t.state = "idle";
    t.type = type;
    t.eatingFrameConter =  0;
    t.frameCounter = 0;
    t.scale =
    t.setVals(x,y,BYTER_WIDTH,BYTER_HEIGHT);

    t.update = ()=>{
        let scale = 1;
        let reSpawnPos = 0;
        let fillText = "";
        if(t.frameCounter > 0)t.frameCounter--;
        let playerDistance = t.getDist(PLAYER.center());
        t.mag -= t.mag*mouseAcc/(maxVel*0.8);
        ctx.fillStyle = 'orange';
        ctx.font = '40px Extrabold sans-serif';
        switch(t.state) {
            case "idle":
                let spawnDist = t.getDist(t.spawnPoint);
                if (t.frameCounter > 0) {
                    fillText = "?";
                } else if (spawnDist.dist > 1) {
                    fillText = "...";
                    t.x -= spawnDist.normalX * 2;
                    t.y -= spawnDist.normalY * 2;
                }
                if (playerDistance.dist < 150) {
                    t.changeState("attack");
                }
                break;
            case "attack":
                if (t.frameCounter > 0) {
                    fillText = "!";
                }
                if (t.frameCounter < 15) {
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
                } else {
                    t.food = t.getClosestLink(t.food, t.food.getParent());
                    let foodDist = t.getDist(t.food);
                    if (foodDist.dist > 30) {
                        t.x -= foodDist.normalX;
                        t.y -= foodDist.normalY;
                    } else {
                        if (!t.eatingFrameCounter) {
                            t.eatingFrameCounter = 180;
                        } else {
                            t.eatingFrameCounter--;
                            if (!t.eatingFrameCounter) {
                                if(t.type == "sleeper"){
                                    t.changeState("sleep");
                                }else{
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
                break;
            case "cooldown":
                if (!t.frameCounter) {
                    t.state = "attack";
                }
                break;
            case "falling":
                if(t.frameCounter >= FALL_FRAMES_HALVED){
                    scale = (t.frameCounter - FALL_FRAMES_HALVED)/FALL_FRAMES_HALVED;
                }else{
                    t.goToSpawn();
                    reSpawnPos = t.frameCounter/FALL_FRAMES_HALVED;
                }
                if(!t.frameCounter) t.changeState("idle");
        }
        t.checkFall();
        let impactDist = (PLAYER.w + t.w)/2;
        if(PLAYER.state != "falling" && playerDistance.dist <= impactDist){
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
        ctx.drawImage(spriteSheet, 0,0,22,21,-t.x,t.y - reSpawnPos*t.y,44*scale,42*scale);
        ctx.restore();
        ctx.strokeStyle = "orange";
        ctx.lineWidth = 2;
        ctx.strokeRect(t.x,t.y - reSpawnPos*t.y,t.w*scale,t.h*scale);
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
    t.getClosestLink = (food, el)=>{
        let closest = food
        if(!el.child){
            return closest;
        }else if(t.getDist(el.child).dist < t.getDist(closest).dist){
            closest = el.child;
        }
        return t.getClosestLink(closest, el.child);
    }
    t.triggerFall = () => {
        t.changeState("falling");
    }
    t.changeState = (state) =>{
        let t = this;
        if(state == "cooldown"){
            t.frameCounter = 30
        }else if(state == "falling"){
            t.frameCounter = FALL_FRAMES_HALVED*2;
        }else{
            t.frameCounter = 45;
        }
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
