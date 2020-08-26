function genHb(x,y,w,h){
    return{
        x: x,
        y: y,
        w: w,
        h: h,
        move: function(varX, varY){
            var t = this;
            var a = {...t}, b = {...t};
            a.x += varX;
            b.y += varY;
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
    return {
        // x: initX,
        // y: initY,
        hb: genHb(initX, initY, 50, 50),
        rope: null,
        setPos: function(modX, modY){
            var t = this;
            t.x += modx;
            t.y += mody;
        },
        update: function(){
            var t = this;
            var yVar = 5*(((stateBits & 4) >> 2) - (stateBits & 1));
            var xVar = 5*(((stateBits & 2) >> 1) - ((stateBits & 8) >> 3));
            t.hb.move(xVar, yVar);
            if(t.rope){
                t.rope.attached = true;
                var childDist = t.rope.getDist();
                var childForceX = (childDist.dist > 5 ? childDist.translateX : 0);
                var childForceY = (childDist.dist > 5 ? childDist.translateY : 0);
                t.hb.move(childForceX, childForceY);
                t.rope.update(t.hb.x, t.hb.y);
                // ctx.strokeStyle = "black"
                // ctx.font = '48px serif';
                // ctx.fillText('distance from origin: ' + t.rope.getDistToOrigin(), 50, 800);
            }
            if(stateBits & 16){
                stateBits ^= 16;
                if(t.rope){
                    if(soc = sockets.find(socket => Math.hypot(socket.conPt[0] - t.hb.x, socket.conPt[1] - t.hb.y) < 30 && !socket.rope)){
                        soc.rope = t.rope;
                    }else{
                        t.rope.attached = false;
                    }
                    t.rope = null;
                }else{
                    t.rope = ropes.find(rope => Math.hypot(rope.hb.x - t.hb.x, rope.hb.y - t.hb.y) < 15) || null;
                }
            }
            ctx.strokeStyle = 'blue';
            ctx.strokeRect(t.hb.x,t.hb.y,t.hb.w,t.hb.h);
        },
    }
}

function genRopeSec(initX, initY, amount){
    return {
        attached: false,
        hb: genHb(initX, initY, 2,2),
        fixedX: initX,
        fixedY: initY,
        amount: amount,
        child: amount > 0 ? genRopeSec(initX, initY, amount -1) : null,
        update(fixedX, fixedY){
            var t = this;
            var tries = 11;
            do{
                if(fixedX){
                    t.hb.x = fixedX;
                    t.hb.y = fixedY;
                }
                tries--;
            }while(!t.solve(true) && tries > 0)
            t.draw();
        },
        solve: function(bool){
            var t = this;
            if(t.child){
                var dist = t.getDist();
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
        getDist: function() {
            var t = this;
            var xdiff = t.hb.x - t.child.hb.x;
            var ydiff = t.hb.y - t.child.hb.y;
            var dist = Math.hypot(xdiff, ydiff);
            var scalDiff = (8 - dist) / dist;
            scalDiff = scalDiff > 0 || isNaN(scalDiff) ? 0 : scalDiff;
            return {
                dist: dist,
                translateX: xdiff * 0.5 * scalDiff,
                translateY: ydiff * 0.5 * scalDiff,
            };
        },
        draw: function(){
            var t = this;
            ctx.beginPath();
            ctx.arc(t.hb.x, t.hb.y, 5,0, 2 * Math.PI, false);
            ctx.lineWidth = 1;
            ctx.strokeStyle = '#003300';
            ctx.stroke();
            if(t.child) t.child.draw();
        }
        // getDistToOrigin: function(total = 0){
        //     var t = this;
        //     if(t.child){
        //         total += t.getDist().dist;
        //         return t.child.getDistToOrigin(total);
        //     }else{
        //         return total;
        //     }
        // }
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
                    console.log("socket has link and not a rope. Generating rope");
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