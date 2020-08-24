function genObj(initX, initY){
    return {
        x: initX,
        y: initY,
        rope: null,
        setPos: function(modX, modY){
            var t = this;
            t.x += modx;
            t.y += mody;
        },
        update: function(){
            var t = this;
            var yVar = 5*(((byte & 4) >> 2) - (byte & 1));
            var xVar = 5*(((byte & 2) >> 1) - ((byte & 8) >> 3));
            t.x += xVar;
            t.y += yVar;
            if(stateBits & 16){
                stateBits ^= 16;
                if(t.rope){
                    t.rope = null;
                }else{
                    t.rope = ropes.find(rope => Math.hypot(rope.x - t.x, rope.y - t.y) < 15) || null;
                }
            }
            if(t.rope){
                var childDist = t.rope.getDist();
                var childForceX = (childDist.dist > 5 ? childDist.translateX : 0);
                var childForceY = (childDist.dist > 5 ? childDist.translateY : 0);
                t.x += childForceX;
                t.y += childForceY;
                t.rope.update(t.x, t.y);
                // ctx.strokeStyle = "black"
                // ctx.font = '48px serif';
                // ctx.fillText('distance from origin: ' + t.rope.getDistToOrigin(), 50, 800);
            }
            ctx.strokeStyle = 'blue';
            ctx.strokeRect(t.x,t.y,50,50);
        },
    }
}

function genRopeSec(initX, initY, amount){
    return {
        x: initX,
        fixedX: initX,
        y: initY,
        fixedY: initY,
        child: amount > 0 ? genRopeSec(initX, initY, amount -1) : null,
        update(fixedX, fixedY){
            var t = this;
            var tries = 11;
            do{
                if(fixedX){
                    t.x = fixedX;
                    t.y = fixedY;
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
                    t.x += dist.translateX;
                    t.y += dist.translateY;
                    t.child.x -= dist.translateX;
                    t.child.y -= dist.translateY;
                }
                return t.child.solve(bool);
            }else{
                t.x = t.fixedX;
                t.y = t.fixedY
                return bool
            }
        },
        getDist: function() {
            var t = this;
            var xdiff = t.x - t.child.x;
            var ydiff = t.y - t.child.y;
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
            ctx.arc(t.x, t.y, 5,0, 2 * Math.PI, false);
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