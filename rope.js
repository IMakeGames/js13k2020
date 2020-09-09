var LINK_DIST_CONSTRAINT = 10;
var ROPE_ANIMATION_FRAMES = 100;
var ROPE_SECTION_WIDTH = 5;
var ROPE_SECTION_HEIGHT = 5;

function RopeSection(initX, initY, amount, color= colorBlue){
    let t = this;
    t.attached = null;
    t.fixedX = initX;
    t.fixedY = initY;
    t.amount = amount;
    t.child = amount > 0 ? new RopeSection(initX, initY, amount -1, color) : null;
    t.frameCounter = 0;
    t.parent = null;
    t.setVals(initX, initY, ROPE_SECTION_WIDTH, ROPE_SECTION_HEIGHT);

    t.update = (fixedHb) =>{
        let tries = 31;
        do{
            if(fixedHb){
                t.x = fixedHb.x;
                t.y = fixedHb.y;
            }
            tries--;
        }while(!t.solve(true) && tries > 0)
        t.draw();
    };

    t.solve = (bool)=>{
        if(munch = stage.enemies.find(muncher => t.getDist(muncher.center()).dist < 150 && muncher.state != "eating")){
            munch.triggerFood(t);
        }
        let distMc = t.getDist(PLAYER.center());
        let maxDist = (t.w + PLAYER.w)/1.5;
        if(distMc.dist <= maxDist){
            bool = false;
            let per = distMc.dist/maxDist;
            // let invPer = (maxDist - distMc.dist)/maxDist;
            let invPer = 1 - per;
            if(t.child){
                t.x -= distMc.translateX*per;
                t.y -= distMc.translateY*per;
            }
            PLAYER.x += distMc.translateX*invPer;
            PLAYER.y += distMc.translateY*invPer;
            //TODO: Check if there is a problem while recoiling: could go through rope. maybe.
            PLAYER.mag = PLAYER.dashFrames ? -dashMaxVel/8 : -1*invPer;
        }
        if(t.child){
            if(!t.child.parent) t.child.parent = t;
            let dist = t.getDist(t.child.center());
            if(dist.dist > LINK_DIST_CONSTRAINT){
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
        t.attached = el;
        el.rope = t;
        if(el instanceof Socket){
            el.color = color;
        }
        t.update(holdPt);
    };

    t.destroy = () =>{
        t.child.parent = null;
        stage.ropes =[stage.ropes[1],t.child, t];
        t.reverse();
    };

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
        if(!t.parent && !t.attached && color != colorRed){
            ctx.beginPath();
            let per = t.frameCounter/ROPE_ANIMATION_FRAMES;
            let invPer = 1 - per;
            let radius = 40*per;
            ctx.arc(t.cX(), t.cY(), radius,0, 2 * Math.PI, false);
            ctx.lineWidth = 10;
            ctx.strokeStyle = 'rgba('+color+', '+ invPer +')';
            ctx.stroke();
            t.frameCounter++;
            if(t.frameCounter > ROPE_ANIMATION_FRAMES){
                t.frameCounter = 0;
            }
        }
        if(t.child){
            ctx.lineWidth = 15;
            ctx.strokeStyle = 'rgba('+color+')';
            ctx.lineCap = "round"
            ctx.beginPath();
            ctx.moveTo(t.cX(), t.cY());
            ctx.lineTo(t.child.cX(),t.child.cY());
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
            ctx.strokeRect(t.x, t.y, 5, 5);
        }
    };
}
RopeSection.prototype = Hitbox();

var SOCKET_ANIMATION_FRAMES = 100;
var SOCKET_WIDTH = 40;
var SOCKET_HEIGHT = 50;

function Socket(x,y,type,dir,amount,color = colorBlue){
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
        t.conPt = [x + 40, y + 23];
    }else if(dir == "right"){
        xoffset = 10;
        t.conPt = [x, y + 23];
    }else{
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
        t.conPt = [x + 22, y + 40];
    }else if(dir == "down"){
        yoffset = 10;
        t.conPt = [x + 22, y];
    }
    t.setVals(x,y,socketWidth, socketHeight);
    t.type = type;
    t.connection = null;
    t.color = color;
    t.frameCounter = SOCKET_ANIMATION_FRAMES/2;
    t.rope = type == "origin" && amount > 0 ? new RopeSection(t.conPt[0],t.conPt[1],amount, color) : null;
    t.update = ()=>{
        if(t.type == "end" && t.rope){
            if(t.connection && !t.connection.rope){
                t.connection.rope = new RopeSection(t.connection.conPt[0], t.connection.conPt[1], t.rope.amount);
                stage.ropes.push(t.connection.rope);
                t.connection.type = "origin";
            }
            t.rope.update({x:t.conPt[0], y:t.conPt[1]});
        }
        if(t.type == "win"){
            ctx.beginPath();
            let per = t.frameCounter/SOCKET_ANIMATION_FRAMES;
            let invPer = 1 - per;
            let radius = 40*invPer;
            ctx.arc(t.conPt[0], t.conPt[1], radius,0, 2 * Math.PI, false);
            ctx.lineWidth = 10;
            ctx.strokeStyle = 'rgba(0, 0, 255, '+ per +')';
            ctx.stroke();
            t.frameCounter++;
            if(t.frameCounter > SOCKET_ANIMATION_FRAMES){
                t.frameCounter = 0;
            }
            if(t.rope){
                triggerWin();
            }
        }
        ctx.fillStyle = '#00c745';
        ctx.fillRect(t.x - xoffset,t.y - yoffset,rectW,rectH);
        ctx.fillRect(t.x - xoffset + xAdded,t.y - yoffset + yAdded,rectW,rectH);
        ctx.fillStyle = "rgb("+t.color+")";
        ctx.fillRect(t.x + xAdded2,t.y + yAdded2,socketWidth,socketHeight);
        if(debugMode){
            ctx.strokeStyle = 'pink';
            ctx.lineWidth = 1;
            ctx.strokeRect(t.x,t.y,t.w,t.h);
        }
    }

}
Socket.prototype = Hitbox();