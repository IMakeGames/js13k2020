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
            if(!t.loaded) t.setup();
            t.enemies.forEach(enemy => enemy.update());
            t.ropes.forEach(rope => !rope.attached ? rope.update():null);
            t.holes.forEach(hole => hole.update());
            t.sockets.forEach(socket => socket.update());
        },
        setup(){
            let t = this;
            let socket1 = genSocket(950, 700, "origin","right", 30);
            let socket2 = genSocket(480, 950, "win", "down");
            let holes= [genHole(10,300,365,75), genHole(300,10,75,365)]
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
            t.enemies.forEach(enemy => enemy.update());
            t.ropes.forEach(rope => !rope.attached ? rope.update():null);
            t.sockets.forEach(socket => socket.update());
        },
        setup(t){
            let socket1 = genSocket(10, 480, "origin","left", 50);
            let socket2 = genSocket(950, 480, "end", "right");
            let socket3 = genSocket(480, 10, "origin","up", 90);
            let socket4 = genSocket(480, 950, "win", "down");
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