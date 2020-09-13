var LINK_DIST_CONSTRAINT = 10;
var ROPE_ANIMATION_FRAMES = 100;
var ROPE_RECOLECTION_FRAMES = 180;
var ROPE_SECTION_WIDTH = 5;
var PLAYER_MIN_DIST = 17;
var PLAYER_MAX_DIST = 31;
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
        let tries = 21;
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
            }
        }
        if(t.attached){
            t.checkEnemyProximity()
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
        let linkDistConstraint = LINK_DIST_CONSTRAINT;
        if(t.recolecting && t.state != "destroy"){
            linkDistConstraint = 0;
        }
        let objList = [PLAYER];
        objList = objList.concat(stage.enemies);
        //TODO implement this better
        //objList = objList.concat(stage.solidBodies);
        it(objList.length, (i)=>{
            let distEn = t.getDist(objList[i].center());
            let minDist = 15;
            if(objList[i] instanceof Player || objList[i] instanceof Byter){
                minDist = PLAYER_MIN_DIST;
            }
            if(distEn.dist <= minDist) {
                bool = false;
                let per = distEn.dist/PLAYER_MIN_DIST;
                let invPer = 1 - per;
                if(t.child){
                    t.x += distEn.normalX*3*per;
                    t.y += distEn.normalY*3*per;
                }
                objList[i].move(-distEn.normalX*3*invPer, -distEn.normalY*3*invPer);
                if(objList[i] instanceof Player && objList[i].dashFrames){
                    objList[i].mag = -dashMaxVel/8;
                }
            }
        });
        objList = null;
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
        t.child.setForDestroy(5);
        t.child.assignOrigin(t.getParent().origin);
        t.getParent().origin = null;
        stage.ropes = stage.ropes.filter(rope => rope !== t.getParent()).concat([t,t.child]);
        t.reverse();
        t.setForDestroy(5);
    }

    t.setForDestroy = (delay)=>{
        t.state = "destroy";
        t.currentOutlineDelay = delay;
        t.ropeAnimationFrames = 5;
        t.animationFrameCounter = 0;
        if(t.child){
            t.child.setForDestroy(delay + 5);
        }
    }

    t.destroy = ()=>{
        stage.ropes = stage.ropes.filter(rope => rope !== t);
        if(t.child && !t.checkInOrigin()){
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
            if(t.attached){
                t.attached.rope = null;
                t.attached = null;
            }
            t.fixedX = t.x;
            t.fixedY = t.y;
        }
    };

    t.checkEnemyProximity = ()=>{
        if(t.state != "destroy"){
            if(byter = stage.enemies.find(byter => !(t.color == colorBlue && byter.type == "trooper") && byter.state == "idle" && t.getDist(byter.center()).dist < 175)){
                byter.triggerFood(t);
            }else if(t.child){
                t.child.checkEnemyProximity();
            }
        }
    }

    t.checkProximity = (ent)=>{
        if(t.state != "destroy"){
            if(t.getDist(ent.center()).dist < 50){
                return true
            }else{
                if(!t.child){
                    return false
                }else{
                    return t.child.checkProximity(ent);
                }
            }
        }else{
            return false;
        }
    }

    t.draw = ()=>{
        if(t.state != "normal" && t.currentOutlineDelay){
            t.currentOutlineDelay--;
        }
        if(((!t.parent && !t.attached) || t.state != "normal") && !t.currentOutlineDelay){
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

var SOCKET_ANIMATION_FRAMES = 180;
var SOCKET_WIDTH = 40;
var SOCKET_HEIGHT = 50;

function Socket([x,y,type,dir,amount,color]){
    let t = this;
    t.outer = []
    t.hbData = []
    t.hitboxes = []
    t.inner = null;
    let plusWidth = 0;
    if(type == "win"){
        plusWidth = 10;
    }
    if(dir == "left"){
        t.outer  = [[x,y,SOCKET_HEIGHT,15],[x,y + 35,SOCKET_HEIGHT,15]]
        t.inner  = [x, y+15, SOCKET_WIDTH+plusWidth, 20]
        t.conPt  = [x + 38, y + 25]
    }
    if(dir == "right"){
        t.outer  = [[x - 10,y,SOCKET_HEIGHT,15],[x - 10, y + 35,SOCKET_HEIGHT,15]]
        t.inner  = [x - plusWidth, y+15, SOCKET_WIDTH+plusWidth, 20]
        t.conPt  = [x + 2, y + 25]
    }
    if(dir == "up"){
        t.outer  = [[x,y,15,SOCKET_HEIGHT],[x + 35, y,15,SOCKET_HEIGHT]]
        t.inner  = [x +15, y ,20, SOCKET_WIDTH+plusWidth]
        t.conPt  = [x + 25, y + 38];
    }
    if(dir == "down"){
        t.outer  = [[x,y - 10,15,SOCKET_HEIGHT],[x + 35, y - 10,15,SOCKET_HEIGHT]]
        t.inner  = [x + 15,y - plusWidth, 20, SOCKET_WIDTH+plusWidth]
        t.conPt  = [x + 25, y];
    }
    t.triggered = false;
    t.type = type;
    t.connection = null;
    if(color){
        t.color = color;
    }else if(type == "win"){
        t.color = colorBlue
    }else if(type == "trigger"){
        t.color = colorYellow;
    }else{
        t.color = colorGray;
    }
    t.animationFrameCounter = SOCKET_ANIMATION_FRAMES/2;
    t.amount = amount;
    t.rope = type == "origin" && amount > 0 ? new RopeSection(t.conPt[0],t.conPt[1],t.amount, color, t) : null;
    it(t.outer.length, (i)=>{
        t.hitboxes.push(new Hitbox(t.outer[i][0],t.outer[i][1],t.outer[i][2],t.outer[i][3]));
    });
    t.update = ()=>{
        if(t.type != "origin"){
            if(t.rope && t.rope.state != "destroy"){
                if(t.connection && !t.connection.rope){
                    t.connection.color = t.color
                    t.connection.amount = t.rope.amount;
                    t.connection.rope = new RopeSection(t.connection.conPt[0], t.connection.conPt[1], t.rope.amount, t.color,t.connection);
                    stage.ropes.push(t.connection.rope);
                    t.connection.type = "origin";
                }else if(t.type == "trigger" && !t.triggered){
                    t.triggered = true;
                    stage.trigger();
                }
                t.rope.update({x:t.conPt[0], y:t.conPt[1]});
            }else if(t.type == "con" && t.connection.type == "origin"){
                t.color = colorGray;
                //stage.ropes = stage.ropes.filter(rop => rop !== t.connection.rope);
                t.connection.color = t.color;
                t.connection.rope.consume();
                //t.connection.rope = null;
                t.connection.type = "con";
            }else if(t.type == "trigger" && t.triggered){
                t.triggered = false;
                stage.trigger();
            }
        }else if(!t.rope && t.color != colorRed){
            t.rope = new RopeSection(t.conPt[0], t.conPt[1], t.amount, t.color,t);
            stage.ropes.push(t.rope);
        }
        ctx.fillStyle = '#00c745';
        it(t.outer.length, (i)=>{
            ctx.fillRect(t.outer[i][0],t.outer[i][1],t.outer[i][2],t.outer[i][3]);
        });
        ctx.fillStyle = "rgb("+t.color+")";
        ctx.fillRect(t.inner[0],t.inner[1] ,t.inner[2], t.inner[3]);
        if(debugMode){
            ctx.strokeStyle = 'pink';
            ctx.lineWidth = 2;
            it(t.hitboxes.length, (i)=>{
                ctx.strokeRect(t.hitboxes[i].x,t.hitboxes[i].y,t.hitboxes[i].w,t.hitboxes[i].h);
            });
        }
        if(t.type == "win"){
            ctx.beginPath();
            let per = t.animationFrameCounter/SOCKET_ANIMATION_FRAMES;
            let invPer = 1 - per;
            let radius = 40*invPer;
            ctx.arc(t.conPt[0], t.conPt[1], radius,0, 2 * Math.PI, false);
            ctx.lineWidth = 15;
            let renderColor;
            if(t.color == colorBlue){
                renderColor = colorLightBlue;
            }else{
                renderColor = colorLightPink;
            }
            ctx.strokeStyle = 'rgba(' + renderColor + ', '+ per +')';
            ctx.stroke();
            t.animationFrameCounter++;
            if(t.animationFrameCounter > SOCKET_ANIMATION_FRAMES){
                t.animationFrameCounter = 0;
            }
        }
    }

    t.setConnection = (socket)=>{
        t.connection = socket;
        socket.connection = t;
    }

}
Socket.prototype = Hitbox();