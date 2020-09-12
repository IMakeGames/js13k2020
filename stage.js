function Stage(setup) {
    let t = this;
    t.enemies = [];
    t.sockets = [];
    t.holes = [];
    t.ropes = [];
    t.solidBodies = [];
    t.update = () => {
        if (!t.loaded) t.setup();
        t.holes.forEach(holes => holes.active ? holes.update() : null);
        t.sockets.forEach(socket => socket.update());
        t.ropes.forEach(rope => !rope.attached ? rope.update() : null);
        t.enemies.forEach(enemy => enemy.update());
    }
    t.getHoles = () => {
        let retHoles = []
        for (let i = 0; i < t.holes.length; i++) {
            if (t.holes[i].active) {
                retHoles = retHoles.concat(t.holes[i].holes);
            }
        }
        return retHoles;
    }
    t.trigger = () => {
        for (let i = 0; i < t.holes.length; i++) {
            t.holes[i].active = !t.holes[i].active;
        }
    }

    t.setup = () => {
        setup(t);
        PLAYER.goToSpawn();
        PLAYER.health = 3;
        t.loaded = true;
    }
}

function stage1() {
    return new Stage(function (t) {
        t.sockets = [new Socket(480, 10, "origin", "up", 90, colorBlue)];
        t.sockets.push(new Socket(480, 950, "win", "down"));
        t.ropes = [t.sockets[0].rope];
        PLAYER.spawnPoint.x = 100;
        PLAYER.spawnPoint.y = 100;
    });
}

function stage2() {
    return new Stage(function (t) {
        t.sockets = [new Socket(950, 700, "origin", "right", 40, colorBlue)];
        t.sockets.push(new Socket(480, 950, "win", "down"));
        t.holes = [genHoles([new Hole(0, 300, 375, 75), new Hole(300, -10, 75, 385)])]
        t.ropes = [t.sockets[0].rope]
        PLAYER.spawnPoint.x = 100;
        PLAYER.spawnPoint.y = 100;
    });
}

function stage3() {
    return new Stage(function (t) {
        t.sockets = [new Socket(480, 10, "origin", "up", 45, colorBlue)];
        t.sockets.push(new Socket(10, 480, "con", "left"));
        t.sockets.push(new Socket(950, 480, "con", "right"));
        t.sockets.push(new Socket(480, 950, "win", "down"));
        t.sockets[1].setConnection(t.sockets[2]);
        t.ropes = [t.sockets[0].rope];
        PLAYER.spawnPoint.x = 100;
        PLAYER.spawnPoint.y = 100;
    });
}

function stage4(){
    return new Stage(function (t) {
        t.sockets = [new Socket(10, 465, "origin", "left", 50, colorRed)];
        t.sockets.push(new Socket(950, 465, "end", "right"));
        t.sockets.push(new Socket(480, 10, "origin", "up", 90, colorBlue));
        t.sockets.push(new Socket(480, 950, "win", "down"));
        t.enemies = [new Byter(900, 100)];
        t.ropes = [t.sockets[0].rope, t.sockets[2].rope];
        PLAYER.spawnPoint.x = 100;
        PLAYER.spawnPoint.y = 100;
        t.sockets[0].rope.attach(t.sockets[1], t.sockets[1].conPt);
    });
}

function stage5(){
    return new Stage(function (t) {
        t.sockets = [new Socket(480, 10, "origin", "up", 45, colorBlue)];
        t.sockets.push(new Socket(10, 480, "con", "left"));
        t.sockets.push(new Socket(950, 480, "con", "right"));
        t.sockets.push(new Socket(480, 950, "win", "down"));
        t.enemies = [new Byter(500, 900)];
        t.sockets[1].setConnection(t.sockets[2]);
        t.ropes = [t.sockets[0].rope];
        PLAYER.spawnPoint.x = 100;
        PLAYER.spawnPoint.y = 100;
    })
}

function stage6(){
    return new Stage(function (t) {
        t.sockets = [new Socket(480, 10, "origin", "up", 50, colorBlue)];
        t.sockets.push(new Socket(10, 425, "con", "left"));
        t.sockets.push(new Socket(950, 505, "con", "right"));
        t.sockets.push(new Socket(425, 950, "win", "down"));
        t.holes = [genHoles([new Hole(0, 510, 600, 100), new Hole(400, 390, 600, 100)])];
        t.enemies = [new Byter(810, 810, "active")];
        t.ropes = [t.sockets[0].rope];
        t.sockets[1].setConnection(t.sockets[2]);
        PLAYER.spawnPoint.x = 100;
        PLAYER.spawnPoint.y = 850;
    })
}

function stage7(){
    return new Stage(function (t) {
        t.sockets = [new Socket(950, 100, "origin", "right", 70, colorBlue)];
        t.sockets.push(new Socket(600, 950, "win", "down"));
        t.sockets.push(new Socket(750, 10, "origin", "up", 15, colorRed));
        t.sockets.push(new Socket(950, 250, "end", "right"));
        t.sockets.push(new Socket(500, 950, "origin", "down", 50, colorYellow));
        t.sockets.push(new Socket(10, 500, "trigger", "left"));
        t.holes = [genHoles([new Hole(0, 300, 365, 75), new Hole(300, -10, 75, 385)])];
        t.holes.push(genHoles([new Hole(635, 300, 365, 75), new Hole(625, -10, 75, 385)], false));
        t.enemies = [new Byter(100, 100, "active")];
        t.ropes = [t.sockets[0].rope, t.sockets[4].rope];
        t.sockets[2].rope.attach(t.sockets[3], t.sockets[3].conPt);
        // t.sockets[1].setConnection(t.sockets[2]);
        PLAYER.spawnPoint.x = 100;
        PLAYER.spawnPoint.y = 850;
    })
}

function stage7(){
    return new Stage(function (t) {
        t.sockets = [new Socket(950, 100, "origin", "right", 70, colorBlue)];
        t.sockets.push(new Socket(600, 950, "win", "down"));
        t.sockets.push(new Socket(750, 10, "origin", "up", 15, colorRed));
        t.sockets.push(new Socket(950, 250, "end", "right"));
        t.sockets.push(new Socket(500, 950, "origin", "down", 50, colorYellow));
        t.sockets.push(new Socket(10, 500, "trigger", "left"));
        t.holes = [genHoles([new Hole(0, 300, 365, 75), new Hole(300, -10, 75, 385)])];
        t.holes.push(genHoles([new Hole(635, 300, 365, 75), new Hole(625, -10, 75, 385)], false));
        t.enemies = [new Byter(100, 100, "active")];
        t.ropes = [t.sockets[0].rope, t.sockets[4].rope];
        t.sockets[2].rope.attach(t.sockets[3], t.sockets[3].conPt);
        // t.sockets[1].setConnection(t.sockets[2]);
        PLAYER.spawnPoint.x = 100;
        PLAYER.spawnPoint.y = 850;
    })
}


var genHoles = (holeList, active = true) => {
    let hidden = document.createElement('canvas');
    hidden.width = 60;
    hidden.height = 60;
    let yOffset = 10;
    return {
        holes: holeList,
        canvas: hidden,
        active: active,
        signs: [[1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1]],
        colors: [[50, 0, 0], [80, 15, 40], [110, 30, 80], [140, 45, 120]],
        //colors: [[0,25,50],[25,50,75],[50,75,0],[75,0,25]],
        ranges: [{min: 50, max: 140}, {min: 0, max: 45}, {min: 0, max: 120}],
        //ranges: [{min:0, max:60}, {min: 0, max: 60},{min:0, max:60}],
        stops: [0, 0.17, 0.33, 0.5, 0.67, 0.83, 1],
        gradients: [],
        update() {
            let t = this;
            ctx.save();

            //CREATE CLIP PATH
            //let p2D = new Path2D();
            ctx.beginPath();
            for (let i = 0; i < t.holes.length; i++) {
                let holeHb = t.holes[i].update();
                let sectionLength = 10;
                ctx.moveTo(holeHb.x, holeHb.y);
                //top
                let divisor = getNextWholeDivisor(holeHb.w, sectionLength);
                let sections = holeHb.w / divisor
                let variableLength = 10;
                for (let i = 1; i <= sections; i++) {
                    ctx.lineTo(holeHb.x + divisor * i, holeHb.y + yOffset + variableLength);
                    variableLength = Math.abs(variableLength - 10);
                }
                //right
                divisor = getNextWholeDivisor(holeHb.h, sectionLength);
                sections = holeHb.h / divisor
                variableLength = 10;
                for (let i = 1; i <= sections; i++) {
                    ctx.lineTo(holeHb.x + holeHb.w - variableLength, holeHb.y + divisor * i + yOffset);
                    variableLength = Math.abs(variableLength - 10);
                }
                //bottom
                divisor = getNextWholeDivisor(holeHb.w, sectionLength);
                sections = holeHb.w / divisor
                variableLength = 10;
                for (let i = 1; i <= sections; i++) {
                    ctx.lineTo(holeHb.x + holeHb.w - divisor * i, holeHb.y + holeHb.h - variableLength + yOffset);
                    variableLength = Math.abs(variableLength - 10);
                }
                //left
                divisor = getNextWholeDivisor(holeHb.h, sectionLength);
                sections = holeHb.h / divisor
                variableLength = 10;
                for (let i = 1; i <= sections; i++) {
                    ctx.lineTo(holeHb.x + variableLength, holeHb.y + holeHb.h - divisor * i + yOffset);
                    variableLength = Math.abs(variableLength - 10);
                }
                //p2D.rect(holeHb.x, holeHb.y, holeHb.w, holeHb.h);
                if (debugMode) {
                    ctx.strokeStyle = "red";
                    ctx.lineWidth = 2;
                    ctx.strokeRect(holeHb.x, holeHb.y, holeHb.w, holeHb.h);
                }
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
            for (let i = 0; i < 4; i++) {
                t.gradients.push(ctxHidden.createLinearGradient(gv[i][0], gv[i][1], 30, 30));
            }
            let order = [0, 1, 2, 3, 2, 1, 0];

            //UPDATE COLORS
            for (let i = 0; i < 4; i++) {
                for (let j = 0; j < 3; j++) {
                    if (t.colors[i][j] < t.ranges[j].min || t.colors[i][j] > t.ranges[j].max) {
                        t.signs[i][j] *= -1;
                    }
                    t.colors[i][j] += t.signs[i][j];
                }
            }
            //CREATE COLOR STOPS AND DRAW GRADIENTS
            for (let i = 0; i < 4; i++) {
                let gradient = t.gradients[i];
                for (let k = 0; k < order.length; k++) {
                    gradient.addColorStop(t.stops[k], 'rgb(' + t.colors[order[k]][0] + ', ' + t.colors[order[k]][1] + ', ' + t.colors[order[k]][2] + ')');
                }
                ctxHidden.fillStyle = gradient;
                ctxHidden.fillRect(gv[i][0] / 2, gv[i][1] / 2, 30, 30);
            }

            //MAKE PATTERN OUT OF CANVAS AND DRAW
            let pattern = ctx.createPattern(t.canvas, 'repeat');
            ctx.fillStyle = pattern;
            ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            ctx.restore();
        }
    }
}

function Hole(x, y, w, h) {
    let t = this;
    t.setVals(x, y, w, h);
    t.update = () => {
        return t;
    }
}

Hole.prototype = Hitbox();