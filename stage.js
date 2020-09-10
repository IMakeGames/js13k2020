function Stage(setup){
    let t = this;
    t.enemies = [];
    t.sockets = [];
    t.holes = [];
    t.ropes = [];

    t.update = ()=>{
        if(!t.loaded) t.setup();
        t.enemies.forEach(enemy => enemy.update());
        t.sockets.forEach(socket => socket.update());
        t.ropes.forEach(rope => !rope.attached ? rope.update():null);
        t.holes.update();
    }

    t.setup = ()=>{
        let vars = setup();
        PLAYER.goToSpawn();
        t.sockets =vars.sockets;
        t.ropes = vars.ropes;
        t.holes = vars.holes || genHoles([]);
        t.enemies = vars.enemies || [];
        t.loaded = true;
    }
}

var stage1 = new Stage(function(){
    let socket1 = new Socket(480, 10, "origin","up", 90, colorBlue);
    let socket2 = new Socket(480, 950, "win", "down");
    spawnPoint.x = 100;
    spawnPoint.y = 100;
    return{
        sockets: [socket1, socket2],
        ropes: [socket1.rope]
    }
});

var stage2 = new Stage(function(){
    let socket1 = new Socket(950, 700, "origin","right", 40,colorBlue);
    let socket2 = new Socket(480, 950, "win", "down");
    let holes= genHoles([new Hole(10,300,365,75), new Hole(300,10,75,365)])
    spawnPoint.x = 100;
    spawnPoint.y = 100;
    return{
        sockets: [socket1, socket2],
        ropes: [socket1.rope],
        holes: holes
    }
});

var stage3 = new Stage(function(){
    let socket1 = new Socket(480, 10, "origin","up", 50, colorBlue);
    let socket2 = new Socket(10, 480, "con","left");
    let socket3 = new Socket(950, 480, "con", "right");
    let socket4 = new Socket(480, 950, "win", "down");
    socket2.setConnection(socket3);
    spawnPoint.x = 100;
    spawnPoint.y = 100;
    return {
        sockets: [socket1, socket2, socket3, socket4],
        ropes: [socket1.rope],
    }
});

var stage4 = new Stage(function(){
    let socket1 = new Socket(10, 465, "origin","left", 50, colorRed);
    let socket2 = new Socket(950, 465, "end", "right");
    let socket3 = new Socket(480, 10, "origin","up", 90,colorBlue);
    let socket4 = new Socket(480, 950, "win", "down");
    let enemy = new Byter(900,100);
    spawnPoint.x = 100;
    spawnPoint.y = 100;
    socket1.rope.attach(socket2, socket2.conPt);
    return {
        sockets: [socket1, socket2, socket3, socket4],
        ropes: [socket1.rope, socket3.rope],
        enemies: [enemy]
    }
});

// var stage5 = new Stage(function () {
//     let socket1 = new Socket(10, 465, "origin", "left", 50, colorRed);
//     let socket2 = new Socket(950, 465, "end", "right");
//     let socket3 = new Socket(480, 10, "origin", "up", 90, colorBlue);
//     let socket4 = new Socket(480, 950, "win", "down");
// })

var genHoles = (holeList)=>{
    let hidden = document.createElement('canvas');
    hidden.width = 60;
    hidden.height = 60;
    return {
        holes: holeList,
        canvas: hidden,
        signs: [[1,1,1],[1,1,1],[1,1,1],[1,1,1]],
        colors: [[50,0,0],[80,15,40],[110,30,80],[140,45,120]],
        //colors: [[0,25,50],[25,50,75],[50,75,0],[75,0,25]],
        ranges: [{min:50, max:140}, {min: 0, max: 45},{min:0, max:120}],
        //ranges: [{min:0, max:60}, {min: 0, max: 60},{min:0, max:60}],
        stops: [0,0.17,0.33,0.5,0.67,0.83,1],
        gradients: [],
        update(){
            let t = this;
            ctx.save();

            //CREATE CLIP PATH
            //let p2D = new Path2D();
            ctx.beginPath();
            for(let i = 0; i < t.holes.length;i++){
                let holeHb = t.holes[i].update();
                let sectionLength = 10;
                ctx.moveTo(holeHb.x, holeHb.y);
                //top
                let divisor = getNextWholeDivisor(holeHb.w, sectionLength);
                let sections = holeHb.w/divisor
                let variableLength= 10;
                for(let i = 1; i <= sections;i++){
                    ctx.lineTo(holeHb.x+divisor*i,holeHb.y + variableLength);
                    variableLength = Math.abs(variableLength - 10);
                }
                //right
                divisor = getNextWholeDivisor(holeHb.h, sectionLength);
                sections = holeHb.h/divisor
                variableLength= 10;
                for(let i = 1; i <= sections;i++){
                    ctx.lineTo(holeHb.x + holeHb.w -variableLength,holeHb.y+divisor*i);
                    variableLength = Math.abs(variableLength - 10);
                }
                //bottom
                divisor = getNextWholeDivisor(holeHb.w, sectionLength);
                sections = holeHb.w/divisor
                variableLength= 10;
                for(let i = 1; i <= sections;i++){
                    ctx.lineTo(holeHb.x + holeHb.w - divisor*i,holeHb.y + holeHb.h - variableLength);
                    variableLength = Math.abs(variableLength - 10);
                }
                //left
                divisor = getNextWholeDivisor(holeHb.h, sectionLength);
                sections = holeHb.h/divisor
                variableLength= 10;
                for(let i = 1; i <= sections;i++){
                    ctx.lineTo(holeHb.x + variableLength,holeHb.y + holeHb.h - divisor*i);
                    variableLength = Math.abs(variableLength - 10);
                }
                //p2D.rect(holeHb.x, holeHb.y, holeHb.w, holeHb.h);
            }
            ctx.clip("nonzero");

            //SETUP HIDDEN CANVAS
            let ctxHidden = hidden.getContext("2d");
            ctxHidden.clearRect(0, 0, ctxHidden.canvas.width, ctxHidden.canvas.height);
            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            let gv = [
                [0, 0],
                [60, 0],
                [0, 60],
                [60, 60]
            ];
            //CREATE GRADIENTS
            for(let i = 0; i < 4; i++){
                t.gradients.push(ctxHidden.createLinearGradient(gv[i][0],gv[i][1],30,30));
            }
            let order = [0,1,2,3,2,1,0];

            //UPDATE COLORS
            for(let i = 0;i < 4;i++){
                for(let j = 0;j < 3;j++){
                    if(t.colors[i][j] < t.ranges[j].min || t.colors[i][j] > t.ranges[j].max){
                        t.signs[i][j] *=-1;
                    }
                    t.colors[i][j] += t.signs[i][j];
                }
            }
            //CREATE COLOR STOPS AND DRAW GRADIENTS
            for(let i = 0;i < 4;i++) {
                let gradient = t.gradients[i];
                for(let k = 0;k<order.length;k++){
                    gradient.addColorStop(t.stops[k],'rgb('+t.colors[order[k]][0]+', '+t.colors[order[k]][1]+', '+t.colors[order[k]][2]+')');
                }
                ctxHidden.fillStyle = gradient;
                ctxHidden.fillRect(gv[i][0]/2,gv[i][1]/2,30,30);
            }

            //MAKE PATTERN OUT OF CANVAS AND DRAW
            let pattern = ctx.createPattern(t.canvas, 'repeat');
            ctx.fillStyle=pattern;
            ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            ctx.restore();
        }
    }
}
var TIME_BEFORE_FALL = 50;
function Hole(x,y,w,h){
    let t = this;
    t.setVals(x,y,w,h);
    t.timerStamp = 0;
    t.update = ()=>{
        if(PLAYER.x >= t.x && PLAYER.x+PLAYER.w <= t.x + t.w && PLAYER.y >= t.y && PLAYER.y + PLAYER.h <= t.y + t.h){
            if(!t.timerStamp){
                t.timerStamp = Date.now();
            }else if(Date.now() - t.timerStamp >= TIME_BEFORE_FALL && PLAYER.state != "falling"){
                PLAYER.triggerFall();
            }
        }else{
            t.timerStamp = 0;
        }
        return t;
    }
}
Hole.prototype = Hitbox();