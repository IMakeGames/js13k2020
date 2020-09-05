function genRopeSec(initX, initY, amount){
    let hb = genHb(initX, initY, 5, 5);
    let linkDistConstraint = 10;
    let animationFrames = 100;
//    links.push(hb);
    return {
        attached: null,
        hb: hb,
        fixedX: initX,
        fixedY: initY,
        amount: amount,
        child: amount > 0 ? genRopeSec(initX, initY, amount -1) : null,
        frameCounter: 0,
        parent: null,
        update(fixedHb){
            let t = this;
            let tries = 31;
            do{
                if(fixedHb){
                    t.hb.x = fixedHb.x;
                    t.hb.y = fixedHb.y;
                }
                tries--;
            }while(!t.solve(true) && tries > 0)
            t.draw();
        },
        solve(bool){
            let t = this;
            if(munch = stage.enemies.find(muncher => getDist(t.hb, muncher.hb).dist < 150)){
                munch.triggerFood(t);
            }
            if(t.child){
                if(!t.child.parent) t.child.parent = t;
                let dist = getDist(t.hb,t.child.hb);
                if(dist.dist > linkDistConstraint){
                    bool = false;
                    t.hb.x += dist.translateX;
                    t.hb.y += dist.translateY;
                    t.child.hb.x -= dist.translateX;
                    t.child.hb.y -= dist.translateY;
                }
                let distMc = getDist(t.hb, playa.hb);
                let maxDist = (t.hb.w + playa.hb.w)/1.5;
                if(distMc.dist <= maxDist){
                    bool = false;
                    let per = distMc.dist/maxDist;
                    // let invPer = (maxDist - distMc.dist)/maxDist;
                    let invPer = 1 - per;
                    t.hb.x -= distMc.translateX*per;
                    t.hb.y -= distMc.translateY*per;
                    playa.hb.x += distMc.translateX*invPer;
                    playa.hb.y += distMc.translateY*invPer;
                    //TODO: Check if there is a problem while recoiling: could go through rope. maybe.
                    playa.hb.mag = playa.dashFrames ? -dashMaxVel/8 : -1*invPer;
                }
                return t.child.solve(bool);
            }else{
                t.hb.x = t.fixedX;
                t.hb.y = t.fixedY
                return bool
            }
        },
        attach(el, holdPt){
            let t = this;
            t.attached = el;
            el.rope = t;
            t.update(holdPt);
        },
        destroy(){
            let t = this;
            t.child.parent = null;
            stage.ropes =[stage.ropes[1],t.child, t];
            t.reverse();
        },
        reverse(){
            let t = this;
            t.child = t.parent;
            if(t.child) {
                t.child.reverse();
            }else{
                t.attached.rope = null;
                t.attached = null;
                t.fixedX = t.hb.x;
                t.fixedY = t.hb.y;
            }
        },
        draw(){
            let t = this;
            if(!t.parent && !t.attached){
                ctx.beginPath();
                let per = t.frameCounter/animationFrames;
                let invPer = 1 - per;
                let radius = 40*per;
                ctx.arc(t.hb.x, t.hb.y, radius,0, 2 * Math.PI, false);
                ctx.lineWidth = 6;
                ctx.strokeStyle = 'rgba(8, 29, 133, '+ invPer +')';
                ctx.stroke();
                t.frameCounter++;
                if(t.frameCounter > animationFrames){
                    t.frameCounter = 0;
                }
            }
            // ctx.beginPath();
            // ctx.arc(t.hb.x, t.hb.y, 5,0, 2 * Math.PI, false);
            // ctx.lineWidth = 1;
            // ctx.strokeStyle = '#003300';
            // ctx.stroke();
            if(t.child){
                ctx.lineWidth = 15;
                ctx.strokeStyle = "yellow";
                ctx.lineCap = "round"
                ctx.beginPath();
                ctx.moveTo(t.hb.x, t.hb.y);
                ctx.lineTo(t.child.hb.x,t.child.hb.y);
                ctx.stroke();
                t.child.draw();
            }
        },
    }
}

function genSocket(x,y,type,dir,amount,connection){
    let wh;
    let conPt;
    let add = dir == "left" || dir == "up" ? 40 : 0;
    let animationFrames = 100;
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
        connection: connection,
        frameCounter: animationFrames/2,
        conPt: conPt,
        rope: type == "origin" && amount > 0 ? genRopeSec(conPt[0],conPt[1],amount) : null,
        update(){
            let t = this;
            if(t.type == "end" && t.rope){
                if(t.connection && !t.connection.rope){
                    t.connection.rope = genRopeSec(t.connection.conPt[0], t.connection.conPt[1], t.rope.amount);
                    stage.ropes.push(t.connection.rope);
                    t.connection.type = "origin";
                }
                t.rope.update({x:t.conPt[0], y:t.conPt[1]});
            }
            if(t.type == "win"){
                ctx.beginPath();
                let per = t.frameCounter/animationFrames;
                let invPer = 1 - per;
                let radius = 40*invPer;
                ctx.arc(t.conPt[0], t.conPt[1], radius,0, 2 * Math.PI, false);
                ctx.lineWidth = 6;
                ctx.strokeStyle = 'rgba(8, 29, 133, '+ per +')';
                ctx.stroke();
                t.frameCounter++;
                if(t.frameCounter > animationFrames){
                    t.frameCounter = 0;
                }
                if(t.rope){
                    triggerWin();
                }
            }
            ctx.strokeStyle = 'green';
            ctx.lineWidth = "1";
            ctx.strokeRect(t.hb.x,t.hb.y,t.hb.w,t.hb.h);
        }
    }
}
