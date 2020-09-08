let stage1 = ()=>{
    return {
        enemies: [],
        sockets: [],
        holes: [],
        ropes: [],
        update: function(){
            let t = this;
            if(!t.loaded) t.setup(t);
            t.enemies.forEach(enemy => enemy.update());
            t.ropes.forEach(rope => !rope.attached ? rope.update():null);
            t.sockets.forEach(socket => socket.update());
            t.holes.forEach(hole => hole.update());
        },
        setup(t){
            let socket1 = genSocket(480, 10, "origin","up", 90);
            let socket2 = genSocket(480, 950, "win", "down");
            spawnPoint.x = 100;
            spawnPoint.y = 100;
            playa.goToSpawn();
            t.sockets = [socket1, socket2];
            t.ropes = [socket1.rope];
            t.loaded = true;
        }
    }
}
let stage2 = ()=>{
    return {
        enemies: [],
        loaded: false,
        sockets: null,
        holes: null,
        ropes: null,
        update: function(){
            let t = this;
            if(!t.loaded) t.setup(t);
            t.enemies.forEach(enemy => enemy.update());
            t.ropes.forEach(rope => !rope.attached ? rope.update():null);
            t.holes.update();
            t.sockets.forEach(socket => socket.update());
        },
        setup(t){
            let socket1 = genSocket(950, 700, "origin","right", 30);
            let socket2 = genSocket(480, 950, "win", "down");
            let holes= genHoles([hole(10,300,365,75), hole(300,10,75,365)])
            spawnPoint.x = 100;
            spawnPoint.y = 100;
            playa.goToSpawn();
            t.sockets = [socket1, socket2];
            t.ropes = [socket1.rope];
            t.holes = holes;
            t.loaded = true;
        }
    }
}
let stage3 = ()=>{
    let socket1 = genSocket(480, 10, "origin","up", 40);
    let socket2 = genSocket(10, 480, "end","left");
    let socket3 = genSocket(950, 480, "end", "right");
    let socket4 = genSocket(480, 950, "win", "down");
    socket2.connection = socket3;
    return {
        enemies: [],
        sockets: [socket1, socket2, socket3, socket4],
        ropes: [socket1.rope],
        update: function(){
            let t = this;
            t.enemies.forEach(enemy => enemy.update());
            t.ropes.forEach(rope => !rope.attached ? rope.update():null);
            t.sockets.forEach(socket => socket.update());
        }
    }
}
let stage4 = ()=>{
    return {
        enemies: [genMuncher(900,100)],
        loaded: false,
        sockets: null,
        ropes: null,
        update(){
            let t = this;
            if(!t.loaded) t.setup(t);
            t.ropes.forEach(rope => !rope.attached ? rope.update():null);
            t.sockets.forEach(socket => socket.update());
            t.enemies.forEach(enemy => enemy.update());
        },
        setup(t){
            let socket1 = genSocket(10, 480, "origin","left", 50, colorRed);
            let socket2 = genSocket(950, 480, "end", "right", colorBlue);
            let socket3 = genSocket(480, 10, "origin","up", 90);
            let socket4 = genSocket(480, 950, "win", "down", colorBlue);
            spawnPoint.x = 100;
            spawnPoint.y = 100;
            playa.goToSpawn();
            socket1.rope.attach(socket2, socket2.conPt);
            t.sockets = [socket1, socket2, socket3, socket4];
            t.ropes = [socket1.rope, socket3.rope];
            t.loaded = true;
        }
    }
}
var genHoles = (holeList)=>{
    const hidden = document.createElement('canvas');
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

            //CREATE GRADIENTS
            t.gradients.push(ctxHidden.createLinearGradient(0, 0, 30, 30));
            t.gradients.push(ctxHidden.createLinearGradient(60, 0, 30, 30));
            t.gradients.push(ctxHidden.createLinearGradient(0, 60, 30, 30));
            t.gradients.push(ctxHidden.createLinearGradient(60, 60, 30, 30));
            let order = [0,1,2,3,2,1,0];

            //UPDATE COLORS
            for(let i = 0;i < 4;i++){
                for(let j = 0;j < 3;j++){
                    if(t.colors[i][j] < t.ranges[j].min || t.colors[i][j] > t.ranges[j].max){
                        t.signs[i][j] *=-1;
                    }
                    t.colors[i][j] += t.signs[i][j];
                }
                // for(let k = 0;k<order.length;k++){
                //     t.gradients[i].addColorStop(t.stops[k],'rgb('+t.colors[order[k]][0]+', '+t.colors[order[k]][1]+', '+t.colors[order[k]][2]+')');
                // }
            }
            for(let i = 0;i < 4;i++) {
                for(let k = 0;k<order.length;k++){
                    t.gradients[i].addColorStop(t.stops[k],'rgb('+t.colors[order[k]][0]+', '+t.colors[order[k]][1]+', '+t.colors[order[k]][2]+')');
                }
            }

            //DRAW THE GRADIENTS
            ctxHidden.fillStyle = t.gradients[0];
            ctxHidden.fillRect(0, 0, 30, 30);
            ctxHidden.fillStyle = t.gradients[1];
            ctxHidden.fillRect(30,0,30,30);
            ctxHidden.fillStyle = t.gradients[2];
            ctxHidden.fillRect(0, 30, 30, 30);
            ctxHidden.fillStyle = t.gradients[3];
            ctxHidden.fillRect(30,30,30,30);

            //MAKE PATTERN OUT OF CANVAS AND DRAW
            const pattern = ctx.createPattern(t.canvas, 'repeat');
            ctx.fillStyle=pattern;
            ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            ctx.restore();
        }
    }
}
var hole = (x,y,w,h)=>{
    let timeBeforeFall = 50;
    return {
        hb: genHb(x,y,w,h),
        timerStamp: 0,
        update(){
            let t = this;
            let playaX = playa.hb.x - playa.hb.w/2;
            let playaY = playa.hb.y - playa.hb.h/2;
            if(playaX >= t.hb.x && playaX+playa.hb.w <= t.hb.x + t.hb.w && playaY >= t.hb.y && playaY+playa.hb.h <= t.hb.y + t.hb.h){
                if(!t.timerStamp){
                    t.timerStamp = Date.now();
                }else if(Date.now() - t.timerStamp >= timeBeforeFall && playa.state != "falling"){
                    playa.triggerFall();
                }
            }else{
                t.timerStamp = 0;
            }
            return t.hb;
        }
    }
}