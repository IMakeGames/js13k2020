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
        update: function(byte, ctx){
            var t = this;
            var yVar = 3*(((byte & 4) >> 2) - (byte & 1));
            var xVar = 3*(((byte & 2) >> 1) - ((byte & 8) >> 3));

            t.x += xVar;
            t.y += yVar;
            var tries = 26;
            do{
                t.rope.x = t.x;
                t.rope.y = t.y;
                tries--;
            }while(!t.rope.solve(true) && tries > 0)
            ctx.strokeStyle = "black"
            ctx.font = '48px serif';
            ctx.fillText('distance from origin: ' + t.rope.getDistToOrigin(), 50, 800);
            ctx.strokeStyle = 'red';
            ctx.strokeRect(t.x,t.y,50,50)
            t.rope.draw();
        },
    }
}

function genRopeSec(initX, initY, amount){
    return {
        x: initX,
        fixedX: initX,
        y: initY,
        fixedY: initY,
        amount: amount,
        child: amount > 0 ? genRopeSec(initX, initY, amount -1) : null,
        solve: function(bool){
            var t = this;
            if(t.child){
                var dist = t.getDist();
                if(dist.dist > 15){
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
            var scalDiff = (15 - dist) / dist;
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
            ctx.arc(this.x, this.y, 5,0, 2 * Math.PI, false);
            ctx.lineWidth = 1;
            ctx.strokeStyle = '#003300';
            ctx.stroke();
            if(t.child) t.child.draw();
        },
        getDistToOrigin: function(total = 0){
            var t = this;
            if(t.child){
                total += t.getDist().dist;
                return t.child.getDistToOrigin(total);
            }else{
                return total;
            }
        }
    }
}