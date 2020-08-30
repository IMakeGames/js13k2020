function genHb(x,y,w,h){
    return{
        x: x,
        y: y,
        w: w,
        h: h,
        move: function(varX, varY){
            var t = this;
            var a = {...t}, b = {...t};
            a.x += varX - w/2;
            b.y += varY - h/2;
            if(!boundaries.find(bound => bound.checkColission(a))){
                t.x += varX;
            }
            if(!boundaries.find(bound => bound.checkColission(b))){
                t.y += varY;
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
        vel: {m: 0, ang: 0},
        dashFrames: 0,
        dashCoolDown: 0,
        hb: genHb(initX, initY, 20, 20),
        rope: null,
        update: function(){
            var t = this;
            t.vel.m -= t.dashFrames ? t.vel.m*dashAcc/dashMaxVel : t.vel.m*mouseAcc/maxVel;
            if(!t.dashFrames && t.dashCoolDown < (totalDashCd - afterDashMovCd) && isMousePressed){
                var mouseDist = getDist(mousePos,t.hb);
                t.vel.m+= mouseDist.dist > 100 ? mouseAcc : (mouseDist.dist/100)*mouseAcc;
                t.vel.ang = mouseDist.angle;
            }else if(t.dashFrames){
                t.vel.m += dashAcc;
            }
            if(t.rope){
                t.rope.attached = true;
                var childDist = getDist(t.hb, t.rope.hb);
                var holdPoint = {x: t.hb.x - childDist.normalX * holdRadius, y: t.hb.y - childDist.normalY * holdRadius}
                var realChildDist = getDist(holdPoint, t.rope.hb);
                var newM = realChildDist.dist > stretchMinDist ? (realChildDist.dist - stretchMinDist)*maxVel/stretchMaxDist : 0;
                var xvecResult =  Math.cos(t.vel.ang)*t.vel.m - Math.cos(childDist.angle)*newM;
                var yvecResult =  Math.sin(t.vel.ang)*t.vel.m - Math.sin(childDist.angle)*newM;
                var newAng = Math.atan2(yvecResult,xvecResult) || 0;
                ctx.fillStyle = "black"
                ctx.font = '25px serif';
                ctx.fillText('mouse angle: ' + t.vel.ang.toFixed(3) + ", new angle: " + newAng.toFixed(3), 50, 800);
                ctx.fillText('vel magnitude: ' + t.vel.m.toFixed(3) + ", new magnitude " + newM.toFixed(3), 50, 850);
                t.vel.ang = newAng;
                t.vel.m -= newM;
                if(t.vel.m < 0) t.vel.m *= -4;
                t.rope.update(holdPoint);
            }
            var xVar = Math.cos(t.vel.ang)*t.vel.m;
            var yVar = Math.sin(t.vel.ang)*t.vel.m;
            t.hb.move(xVar, yVar);
            if(resolveShortClick && !t.dashFrames){
                if(t.rope){
                    // if(soc = sockets.find(socket => getDist(t.hb,{x:socket.conPt[0],y:socket.conPt[1]}).dist < 30 && !socket.rope)){
                    //     soc.rope = t.rope;
                    // }else{
                    //     t.rope.attached = false;
                    // }
                    // t.rope = null;
                }else if(rop = ropes.find(rope => getDist(t.hb, rope.hb).dist < 50)){
                    t.rope = getDist(rop.hb, mousePos).dist < 10 ? rop : null;
                }else if(!t.dashCoolDown && (Date.now() - lastMouseUp < 270)){
                   var distFromMouse = getDist(mousePos, t.hb);
                   t.vel.ang = distFromMouse.angle;
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
    }
}

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
            var tries = 11;
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
            var t = this;
            if(munch = munchers.find(muncher => muncher.state == "idle" && getDist(t.hb, muncher.hb).dist < 20)){
                munch.food = t;
                munch.state = "feed";
            }
            if(t.child){
                var dist = getDist(t.hb,t.child.hb);
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
            var t = this;
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
    var wh;
    var conPt;
    var add = dir == "left" || dir == "up" ? 40 : 0;
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
            var t = this;
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
            var t = this;
            var playerDistance = getDist(t.hb,playa.hb);
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
                    var foodDist = getDist(t.hb,t.food);
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
    var xdiff = hb1.x - hb2.x;
    var ydiff = hb1.y - hb2.y;
    var dist = Math.hypot(xdiff, ydiff);
    var scalDiff = (8 - dist) / dist;
    var angle = Math.atan2(ydiff,xdiff) || 0;
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