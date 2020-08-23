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
            // t.y += 2*(((byte & 4) >> 2) - (byte & 1));
            // t.x += 2*(((byte & 2)>> 1) - ((byte & 8) >> 3));
            var yVar = 3*(((byte & 4) >> 2) - (byte & 1));
            var xVar = 3*(((byte & 2) >> 1) - ((byte & 8) >> 3));
            if(byte & 16){
                var foundRope = ropes.find(rope => rope.getDist(t.x,t.y).dist < 15) || null;
                if(foundRope){
                    t.rope = foundRope;
                    t.rope.parent = t;
                }
            }
            var childForceX = 0;
            var childForceY = 0;
            // if(!t.rope || t.rope.getLast().getDist(t.x,t.y).dist < 375){
            //     var xAxisTotal = xVar + childForceX;
            //     var yAxisTotal = yVar + childForceY;
            //     t.x += xAxisTotal;
            //     t.y += yAxisTotal;
            // }
            if(t.rope){
                ctx.strokeStyle = "black"
                ctx.font = '48px serif';
                ctx.fillText('distance from origin: ' + t.rope.getLast().getDist(t.x,t.y).dist, 50, 800);
                // var childDist = t.rope.getDist(t.x, t.y);
                // childForceX = (childDist.dist > 7 ? childDist.projX : 0)*-1;
                // childForceY = (childDist.dist > 7 ? childDist.projY : 0)*-1;
            }
            var xAxisTotal = xVar + childForceX;
            var yAxisTotal = yVar + childForceY;
            t.x += xAxisTotal;
            t.y += yAxisTotal;
            // var nowTime = Date.now();
            // console.log(1000/(nowTime - lastTime));
            // lastTime = nowTime;

            ctx.strokeStyle = 'red';
            ctx.strokeRect(t.x,t.y,50,50)
        },
    }
}

function genRopeSec(initX, initY, amount){
    return {
        x: initX,
        y: initY,
        parent: null,
        child: amount > 0 ? genRopeSec(initX, initY, amount -1) : null,
        springConst: 5,
        update: function(ctx){
            console.log("upodt")
            var t = this;
            ctx.beginPath();
            ctx.arc(this.x, this.y, 5,0, 2 * Math.PI, false);
            ctx.lineWidth = 1;
            ctx.strokeStyle = '#003300';
            ctx.stroke();
            if(t.child && t.parent){
                if(!t.child.parent){
                    t.child.parent = this;
                }
                var parentDist = t.getDist(t.parent.x, t.parent.y);
                var childDist = t.getDist(t.child.x, t.child.y);
                //var xAxisTotal = ((parentDist.dist > 15 && parentDist.dist < 20) ? parentDist.projX : 0) + (childDist.dist > 15 ? childDist.projX : 0)
                var xAxisTotal = parentDist.projX + childDist.projX;
                //var yAxisTotal = ((parentDist.dist > 15 && parentDist.dist < 20) ? parentDist.projY : 0) + (childDist.dist > 15 ? childDist.projY : 0)
                var yAxisTotal = parentDist.projY + childDist.projY;
                t.x += xAxisTotal;
                t.y += yAxisTotal;
                t.child.update(ctx);
            }
        },
        getDist: function(x, y){
            var t = this;
            var xdiff = x - t.x;
            var ydiff = y - t.y;
            var dist  = Math.hypot(xdiff, ydiff);
            var maxDf = dist - 5;
            maxDf = maxDf > 0 ? maxDf : 0;
            var angle = Math.abs(Math.atan(ydiff/xdiff)) || 0;
            return {
                dist: dist,
                projY: Math.sin(angle)*maxDf*(ydiff/Math.abs(ydiff)) || 0,
                projX: Math.cos(angle)*maxDf*(xdiff/Math.abs(xdiff)) || 0,
                unitX: xdiff/dist || 0,
                unitY: ydiff/dist || 0
            };
        },
      getLast: function(){
            var t = this;
            if(t.child){
                return t.child.getLast();
            }else{
                return t;
            }
      }
    }
}