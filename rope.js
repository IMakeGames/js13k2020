var LINK_DIST_CONSTRAINT = 10;
var ROPE_ANIMATION_FRAMES = 100;
var ROPE_RECOLECTION_FRAMES = 240;
var ROPE_SECTION_WIDTH = 5;
var PLAYER_MIN_DIST = 17;
var PLAYER_MAX_DIST = 23;
var ROPE_SECTION_HEIGHT = 5;
var WIN_FRAMES = 180;
function RopeSection(initX, initY, amount, color, origin = null){
    let t = this;
    t.attached = null;
    t.fixedX = initX;
    t.fixedY = initY;
    t.amount = amount;
    t.color = color;
    t.child = amount > 0 ? new RopeSection(initX, initY, amount -1, color) : null;
    t.origin = origin;
    t.animationFrameCounter = 0;
    t.ropeAnimationFrames = ROPE_ANIMATION_FRAMES;
    t.state = "normal";
    t.currentOutlineDelay = 0;
    t.recolecting = false;
    t.recolectionFrameCounter = 0;
    t.parent = null;
    t.setVals(initX, initY, 0, 0);

    t.update = (fixedHb) =>{
        if(t.recolecting && t.checkInOrigin()){
            t.stopRecolection();
        }

        let tries = 31;
        do{
            if(fixedHb){
                t.x = fixedHb.x;
                t.y = fixedHb.y;
            }
            tries--;
        }while(!t.solve(true) && tries > 0)

        if(t.attached === PLAYER) {
            let distMc = t.getDist(PLAYER.center());
            if (distMc.dist > PLAYER_MAX_DIST) {
                PLAYER.move(distMc.normalX * (distMc.dist -PLAYER_MAX_DIST), distMc.normalY * (distMc.dist -PLAYER_MAX_DIST));
                // PLAYER.x += distMc.normalX * (distMc.dist -PLAYER_MAX_DIST);
                // PLAYER.y += distMc.normalY * (distMc.dist -PLAYER_MAX_DIST);
            }
        }
        if(t.recolectionFrameCounter > 0){
            t.recolectionFrameCounter--;
            if(!t.recolectionFrameCounter){
                t.triggerRecolection();
            }
        }
        t.draw();
    };

    t.solve = (bool)=>{
        if(munch = stage.enemies.find(muncher => t.getDist(muncher.center()).dist < 150 && muncher.state != "eating")){
            munch.triggerFood(t);
        }
        let linkDistConstraint = LINK_DIST_CONSTRAINT;
        if(t.recolecting){
            linkDistConstraint = 0;
        }
        let distMc = t.getDist(PLAYER.center());
        if(distMc.dist <= PLAYER_MIN_DIST) {
            bool = false;
            let per = distMc.dist/PLAYER_MIN_DIST;
            // let invPer = (maxDist - distMc.dist)/maxDist;
            let invPer = 1 - per;
            if(t.child){
                t.x += distMc.normalX*3*per;
                t.y += distMc.normalY*3*per;
            }
            // PLAYER.x -= distMc.normalX*5*invPer;
            // PLAYER.y -= distMc.normalY*5*invPer;
            PLAYER.move(-distMc.normalX*5*invPer, -distMc.normalY*5*invPer);
            //TODO: Check if there is a problem while recoiling: could go through rope. maybe.
            PLAYER.mag = PLAYER.dashFrames ? -dashMaxVel/8 : PLAYER.mag;
        }
        if(t.child){
            if(!t.child.parent) t.child.parent = t;
            let dist = t.getDist(t.child, linkDistConstraint);
            if(dist.dist > linkDistConstraint){
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
    };

    t.attach = (el, holdPt)=>{
        t.detach();
        t.attached = el;
        el.rope = t;
        t.recolectionFrameCounter = 0;
        t.stopRecolection();
        if(el instanceof Socket){
            el.color = t.color;
            if(t.color != colorRed){
                t.setOutlineAnimDelay(0,Math.round(t.amount/5)*10);
            }
        }else{
            t.resetOutlineAnim();
        }
        t.update(holdPt);
    };

    t.setOutlineAnimDelay = (n,i)=>{
        if(!n){
            t.state = "connected";
            n = 5;
            t.currentOutlineDelay = i;
            i -= 10;
        }else{
            n--;
        }
        if(t.child){
            t.child.setOutlineAnimDelay(n, i);
        }
    }

    t.resetOutlineAnim = () =>{
        t.state = "normal";
        t.currentOutlineDelay = 0;
        t.animationFrameCounter = 0;
        if(t.child){
            t.child.resetOutlineAnim();
        }
    }

    t.detach = ()=>{
        if(t.attached){
            t.attached.rope = null;
            t.attached = null;
            t.recolectionFrameCounter = ROPE_RECOLECTION_FRAMES;
        }
    }

    t.triggerRecolection = ()=>{
        t.recolecting = true;
        if(t.child){
            t.child.triggerRecolection();
        }
    }

    t.stopRecolection = ()=>{
        t.recolecting = false;
        if(t.child){
            t.child.stopRecolection();
        }
    }
    t.getParent = ()=>{
        if(!t.parent){
            return t;
        }else{
            return t.parent.getParent();
        }
    }

    t.checkInOrigin = () =>{
        if(t.child){
            if(t.getDist(t.child).dist < 0.1){
                return t.child.checkInOrigin();
            }else{
                return false;
            }
        }else{
            return true;
        }
    }

    t.assignOrigin = (ori) =>{
        t.origin = ori;
        ori.rope = t;
    }

    t.consume = () =>{
        t.child.parent = null;
        t.child.setForDestroy(60);
        t.child.assignOrigin(t.getParent().origin);
        t.getParent().origin = null;
        stage.ropes = stage.ropes.filter(rope => rope !== t.getParent()).concat([t,t.child]);
        t.reverse();
        t.setForDestroy(60);
    }

    t.setForDestroy = (delay)=>{
        t.state = "destroy";
        t.currentOutlineDelay = delay;
        t.ropeAnimationFrames = 10;
        t.animationFrameCounter = 0;
        if(t.child){
            t.child.setForDestroy(delay + 10);
        }
    }

    t.destroy = ()=>{
        stage.ropes = stage.ropes.filter(rope => rope !== t);
        if(t.child){
            t.child.parent = null;
            if(t.origin){
                t.child.assignOrigin(t.origin);
            }
            stage.ropes.push(t.child);
        }else if(t.origin){
            t.origin.rope = null;
            t.origin = null;
        }
    }

    t.reverse = ()=>{
        t.child = t.parent;
        if(t.child) {
            t.child.reverse();
        }else{
            t.attached.rope = null;
            t.attached = null;
            t.fixedX = t.x;
            t.fixedY = t.y;
        }
    };

    t.draw = ()=>{
        if(t.state != "normal" && t.currentOutlineDelay){
            t.currentOutlineDelay--;
        }
        if((!t.parent && !t.attached) || (t.state != "normal" && !t.currentOutlineDelay)){
            t.drawOutline(t.state == "destroy" ? "255,255,255" : null);
        }
        if(t.child){
            ctx.lineWidth = 15;
            ctx.strokeStyle = 'rgb('+((t.state == "destroy" && !t.currentOutlineDelay)? "255,255,255" : color)+')';
            ctx.lineCap = "round"
            ctx.beginPath();
            ctx.moveTo(t.x, t.y);
            ctx.lineTo(t.child.x, t.child.y);
            ctx.stroke();
            t.child.draw();
        }
        // ctx.beginPath();
        // ctx.arc(t.x, t.y, 5,0, 2 * Math.PI, false);
        // ctx.lineWidth = 1;
        // ctx.strokeStyle = '#003300';
        // ctx.stroke();

        // ctx.arc(t.x, t.y, 5,0, 2 * Math.PI, false);
        if(debugMode){
            ctx.lineWidth = 1;
            ctx.strokeStyle = '#003300';
            ctx.strokeRect(t.x - ROPE_SECTION_WIDTH/2, t.y-ROPE_SECTION_HEIGHT/2, 5, 5);
        }
    };
    t.drawOutline = (col) =>{
        ctx.beginPath();
        let per = t.animationFrameCounter/t.ropeAnimationFrames;
        let invPer = 1 - per;
        let radius = 40*per;
        ctx.arc(t.x, t.y, radius,0, 2 * Math.PI, false);
        ctx.lineWidth = 25*invPer;
        ctx.strokeStyle = 'rgba('+ (col ? col : t.color) +', '+ invPer +')';
        ctx.stroke();
        t.animationFrameCounter++;
        if(t.animationFrameCounter > t.ropeAnimationFrames){
            //t.animationFrameCounter = 0;
            if(t.state == "destroy"){
                t.destroy();
            }else{
                t.animationFrameCounter = 0;
            }
        }
    }
}
RopeSection.prototype = Hitbox();

var SOCKET_ANIMATION_FRAMES = 100;
var SOCKET_WIDTH = 40;
var SOCKET_HEIGHT = 50;

function Socket(x,y,type,dir,amount,color){
    let t = this;
    let socketWidth = SOCKET_WIDTH;
    let socketHeight = SOCKET_HEIGHT - 30;
    let xoffset = 0;
    let yoffset = 0;
    let xAdded = 0;
    let yAdded = 35;
    let xAdded2 = 0;
    let yAdded2 = 15;
    let rectW = socketWidth + 10;
    let rectH = socketHeight - 5;
    if(dir == "left"){
        t.conPt = [x + 38, y + 25];
        t.setVals(x,y,SOCKET_WIDTH, SOCKET_HEIGHT);
    }else if(dir == "right"){
        xoffset = 10;
        t.conPt = [x + 2, y + 25];
        t.setVals(x,y,SOCKET_WIDTH, SOCKET_HEIGHT);
    }else{
        t.setVals(x,y,SOCKET_HEIGHT, SOCKET_WIDTH);
        yAdded = 0;
        xAdded = 35;
        xAdded2 = 15;
        yAdded2 = 0;
        socketWidth = SOCKET_HEIGHT - 30;
        socketHeight = SOCKET_WIDTH;
        rectW = socketWidth - 5;
        rectH = socketHeight + 10;
    }
    if(dir == "up"){
        t.conPt = [x + 25, y + 38];
    }else if(dir == "down"){
        yoffset = 10;
        t.conPt = [x + 25, y];
    }
    t.type = type;
    t.connection = null;
    if(color){
        t.color = color;
    }else if(type == "win"){
        t.color = colorBlue
    }else{
        t.color = colorGray;
    }
    t.animationFrameCounter = SOCKET_ANIMATION_FRAMES/2;
    t.winFrameCounter = 0;
    t.amount = amount;
    t.rope = type == "origin" && amount > 0 ? new RopeSection(t.conPt[0],t.conPt[1],t.amount, color, t) : null;
    t.update = ()=>{
        if(t.type != "origin"){
            if(t.rope){
                if(t.connection && !t.connection.rope){
                    t.connection.color = t.color
                    t.connection.amount = t.rope.amount;
                    t.connection.rope = new RopeSection(t.connection.conPt[0], t.connection.conPt[1], t.rope.amount, t.color,t.connection);
                    stage.ropes.push(t.connection.rope);
                    t.connection.type = "origin";
                }
                t.rope.update({x:t.conPt[0], y:t.conPt[1]});
            }else if(t.type == "con" && t.connection.type == "origin"){
                t.color = colorGray;
                stage.ropes = stage.ropes.filter(rop => rop !== t.connection.rope);
                t.connection.color = t.color;
                t.connection.rope = null;
                t.connection.type = "con";
            }
        }
        ctx.fillStyle = '#00c745';
        ctx.fillRect(t.x - xoffset,t.y - yoffset,rectW,rectH);
        ctx.fillRect(t.x - xoffset + xAdded,t.y - yoffset + yAdded,rectW,rectH);
        ctx.fillStyle = "rgb("+t.color+")";
        ctx.fillRect(t.x + xAdded2,t.y + yAdded2,socketWidth,socketHeight);
        if(t.connection && !t.rope){
            ctx.fillStyle = "black";
            ctx.font = '20px monospace';
            ctx.fillText('=', t.x + (t.w*3/8), t.y + (t.h*5/8));
        }
        if(debugMode){
            ctx.strokeStyle = 'pink';
            ctx.lineWidth = 1;
            ctx.strokeRect(t.x,t.y,t.w,t.h);
        }

        if(t.type == "win"){
            if(t.rope){
                t.winFrameCounter++;
                let eatingEnemies = stage.enemies.filter(en => en.state == "eating")
                if(t.winFrameCounter > WIN_FRAMES && !eatingEnemies.length){
                    triggerWin();
                }
            }else{
                ctx.beginPath();
                let per = t.animationFrameCounter/SOCKET_ANIMATION_FRAMES;
                let invPer = 1 - per;
                let radius = 40*invPer;
                ctx.arc(t.conPt[0], t.conPt[1], radius,0, 2 * Math.PI, false);
                ctx.lineWidth = 10;
                ctx.strokeStyle = 'rgba(0, 0, 255, '+ per +')';
                ctx.stroke();
                t.animationFrameCounter++;
                if(t.animationFrameCounter > SOCKET_ANIMATION_FRAMES){
                    t.animationFrameCounter = 0;
                }
            }
        }
    }

    t.setConnection = (socket)=>{
        t.connection = socket;
        socket.connection = t;
    }

}
Socket.prototype = Hitbox();