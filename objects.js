function genHb(x,y,w,h){
    return{
        mag: 0,
        ang: 0,
        x: x,
        y: y,
        w: w,
        h: h,
        move: function(){
            var t = this;
            var xVar = Math.cos(t.ang)*t.mag;
            var yVar = Math.sin(t.ang)*t.mag;
            var a = {...t}, b = {...t};
            a.x += xVar - w/2;
            b.y += yVar - h/2;
            if(!boundaries.find(bound => bound.checkColission(a))){
                t.x += xVar;
            }
            if(!boundaries.find(bound => bound.checkColission(b))){
                t.y += yVar;
            }
        },
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
function genPj(initX, initY){
    var holdRadius = 22;
    var afterDashMovCd = 10;
    var totalDashCd = 50;
    var totalDashFrames = 10;
    var stretchMinDist = 6;
    var stretchMaxDist = 10;
    return {
        dashFrames: 0,
        dashCoolDown: 0,
        hb: genHb(initX, initY, 20, 20),
        rope: null,
        update: function(){
            let t = this;
            t.hb.mag -= t.dashFrames ? t.hb.mag*dashAcc/dashMaxVel : t.hb.mag*mouseAcc/maxVel;
            if(!t.dashFrames && t.dashCoolDown < (totalDashCd - afterDashMovCd) && isMousePressed){
                let mouseDist = getDist(mousePos,t.hb);
                t.hb.mag += mouseDist.dist > 100 ? mouseAcc : (mouseDist.dist/100)*mouseAcc;
                t.hb.ang = mouseDist.angle;
            }
            if(t.dashFrames){
                t.hb.mag += dashAcc;
            }
            if(t.rope){
                t.rope.attached = true;
                let holdPoint =t.getHoldPoint();
                let realChildDist = getDist(holdPoint, t.rope.hb);
                let newM = realChildDist.dist > stretchMinDist ? (realChildDist.dist - stretchMinDist)*maxVel/stretchMaxDist : 0;
                let xvecResult =  Math.cos(t.hb.ang)*t.hb.mag - Math.cos(realChildDist.angle)*newM;
                let yvecResult =  Math.sin(t.hb.ang)*t.hb.mag - Math.sin(realChildDist.angle)*newM;
                let newAng = Math.atan2(yvecResult,xvecResult) || 0;
                t.hb.ang = newAng;
                t.hb.mag -= newM;
                if(t.hb.mag < 0) t.hb.mag *= -4;
                t.rope.update(holdPoint);
            }
            t.hb.move();
            if(resolveShortClick && !t.dashFrames){
                if(t.rope){
                    if(soc = sockets.find(socket => getDist(t.hb,{x:socket.conPt[0],y:socket.conPt[1]}).dist < 30 && !socket.rope)){
                        soc.rope = t.rope;
                    }else{
                        t.rope.attached = false;
                    }
                    t.rope = null;
                }else if(rop = ropes.find(rope => getDist(t.hb, rope.hb).dist < 50)){
                    t.rope = getDist(rop.hb, mousePos).dist < 10 ? rop : null;
                    if(t.rope) t.rope.update(t.getHoldPoint());
                }else if(!t.dashCoolDown && (Date.now() - lastMouseUp < 270)){
                   let distFromMouse = getDist(mousePos, t.hb);
                   t.hb.ang = distFromMouse.angle;
                   // t.dashX = distFromMouse.normalX*20;
                   // t.dashY = distFromMouse.normalY*20;
                   t.dashFrames = totalDashFrames;
                }
            }

            resolveShortClick = false;

            if(t.dashFrames){
                t.dashFrames--;
                if(!t.dashFrames){
                    t.dashCoolDown = totalDashCd;
                }
            }
            if(t.dashCoolDown) t.dashCoolDown--;

            ctx.strokeStyle = 'blue';
            ctx.strokeRect(t.hb.x - 10,t.hb.y - 10,t.hb.w,t.hb.h);
            ctx.strokeStyle = 'red';
            ctx.strokeRect(t.hb.x - 1,t.hb.y - 1,1,1);
            ctx.beginPath();
            ctx.arc(t.hb.x, t.hb.y, holdRadius,0, 2 * Math.PI, false);
            ctx.lineWidth = 1;
            ctx.strokeStyle = 'purple';
            ctx.stroke();
        },
        getHoldPoint: function(){
            let t = this;
            let childDist = getDist(t.hb, t.rope.hb);
            return {x: t.hb.x - childDist.normalX * holdRadius, y: t.hb.y - childDist.normalY * holdRadius}
        }
    }
}


//TODO Delete these functions
function signUnit(number){
    return number/Math.abs(number);
}
var absolute = (number) => Math.abs(number);

function genRopeSec(initX, initY, amount){
    var hb = genHb(initX, initY, 2, 2);
    //boundaries.push(hb);
    return {
        attached: false,
        hb: hb,
        fixedX: initX,
        fixedY: initY,
        amount: amount,
        child: amount > 0 ? genRopeSec(initX, initY, amount -1) : null,
        update(fixedHb){
            var t = this;
            var tries = 21;
            do{
                if(fixedHb){
                    t.hb.x = fixedHb.x;
                    t.hb.y = fixedHb.y;
                }
                tries--;
            }while(!t.solve(true) && tries > 0)
            t.draw();
        },
        solve: function(bool){
            let t = this;
            if(munch = munchers.find(muncher => muncher.state == "idle" && getDist(t.hb, muncher.hb).dist < 20)){
                munch.food = t;
                munch.state = "feed";
            }
            if(t.child){
                let dist = getDist(t.hb,t.child.hb);
                if(dist.dist > 8){
                    bool = false;
                    t.hb.x += dist.translateX;
                    t.hb.y += dist.translateY;
                    t.child.hb.x -= dist.translateX;
                    t.child.hb.y -= dist.translateY;
                }
                return t.child.solve(bool);
            }else{
                t.hb.x = t.fixedX;
                t.hb.y = t.fixedY
                return bool
            }
        },
        draw: function(){
            let t = this;
            ctx.beginPath();
            ctx.arc(t.hb.x, t.hb.y, 5,0, 2 * Math.PI, false);
            ctx.lineWidth = 1;
            ctx.strokeStyle = '#003300';
            ctx.stroke();
            if(t.child) t.child.draw();
        },
    }
}
function genSocket(x,y,type,dir,amount,link){
    let wh;
    let conPt;
    let add = dir == "left" || dir == "up" ? 40 : 0;
    if(dir == "left" || dir == "right"){
        wh = [40,20];
        conPt = [x + add, y + 10]
    }else{
        wh = [20,40];
        conPt = [x + 10, y + add]
    }
    return {
        hb: genHb(x,y,wh[0],wh[1]),
        type: type,
        link: link,
        conPt: conPt,
        rope: type == "origin" && amount > 0 ? genRopeSec(conPt[0],conPt[1],amount) : null,
        update: function(){
            let t = this;
            if(t.type == "end" && t.rope){
                if(t.link && !t.link.rope){
                    t.link.rope = genRopeSec(t.link.conPt[0], t.link.conPt[1], t.rope.amount);
                    ropes.push(t.link.rope);
                }
                t.rope.update(t.conPt[0], t.conPt[1]);
            }
            ctx.strokeStyle = 'green';
            ctx.strokeRect(t.hb.x,t.hb.y,t.hb.w,t.hb.h);
        },
    }
}

function genMuncher(x,y){
    return {
        hb: genHb(x,y,30,30),
        food: null,
        state: "idle",
        update: function(){
            let t = this;
            let playerDistance = getDist(t.hb,playa.hb);
            switch(state){
                case "idle":
                    if(playerDistance.dist < 40){
                        t.state = "attack";
                    }
                    break;
                case "attack":
                    t.hb.x += getDist.normalX*2;
                    t.hb.y += getDist.normalY*2;
                    if(playerDistance.dist > 60){
                        t.state = "idle"
                    }
                    break;
                case "feed":
                    let foodDist = getDist(t.hb,t.food);
                    if(foodDist.dist > 5){
                        t.hb.x += foodDist.normalX;
                        t.hb.y += foodDist.normalY;
                    }else{
                        //here the mf eats the shit
                    }
            }
        }
    }
}

var getDist = (hb1, hb2) => {
    let xdiff = hb1.x - hb2.x;
    let ydiff = hb1.y - hb2.y;
    let dist = Math.hypot(xdiff, ydiff);
    let scalDiff = (8 - dist) / dist;
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