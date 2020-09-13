function Stage(setup) {
    let t = this;
    t.enemies = [];
    t.sockets = [];
    t.holes = [];
    t.ropes = [];
    t.solidBodies = [];
    t.winFrameCounter = 0;
    t.wins = [];
    t.signs = [[1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1]];
    t.colors = [[50, 0, 0], [80, 15, 40], [110, 30, 80], [140, 45, 120]];
    t.ranges = [{min: 50, max: 140}, {min: 0, max: 45}, {min: 0, max: 120}];
    t.stops = [0, 0.17, 0.33, 0.5, 0.67, 0.83, 1];
    t.update = () => {
        if (!t.loaded) t.setup();
        if (t.holes) {
            t.drawHoles();
        }
        t.sockets.forEach(socket => socket.update());
        t.ropes.forEach(rope => !rope.attached ? rope.update() : null);
        t.enemies.forEach(enemy => enemy.update());
        let win = true;
        it(t.wins.length,(i)=>{
            if(!t.wins[i].rope){
                win = false;
            }
        });
        if(win){
            t.winFrameCounter++;
            if(t.winFrameCounter > WIN_FRAMES && !t.enemies.filter(en => en.state == "eating").length){
                triggerWin();
            }
        }else{
            t.winFrameCounter = 0;
        }
    }
    t.getHoles = () => {
        let retHoles = []
        it(t.holes.length,(i)=>{
            if (t.holes[i].active) {
                retHoles = retHoles.concat(t.holes[i].holes);
            }
        })
        return retHoles;
    }

    t.drawHoles = () => {
        let hidden = document.createElement('canvas');
        hidden.width = 60;
        hidden.height = 60;
        let gradients = [];
        ctx.save();
        ctx.beginPath();
        it(t.getHoles().length,(i)=>{
            ctx.moveTo(t.getHoles()[i].x, t.getHoles()[i].y);
            it(t.getHoles()[i].points.length,(j)=>{
                ctx.lineTo(t.getHoles()[i].points[j][0], t.getHoles()[i].points[j][1]);
            });
        });
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
        it(4,(i)=>{
            gradients.push(ctxHidden.createLinearGradient(gv[i][0], gv[i][1], 30, 30));
        });
        let order = [0, 1, 2, 3, 2, 1, 0];

        //UPDATE COLORS
        it(4,(i)=>{
            it(3,(j)=>{
                if (t.colors[i][j] < t.ranges[j].min || t.colors[i][j] > t.ranges[j].max) {
                    t.signs[i][j] *= -1;
                }
                t.colors[i][j] += t.signs[i][j];
            });
        });
        //CREATE COLOR STOPS AND DRAW GRADIENTS
        it(4,(i)=>{
            let gradient = gradients[i];
            it(order.length,(k)=>{
                gradient.addColorStop(t.stops[k], 'rgb(' + t.colors[order[k]][0] + ', ' + t.colors[order[k]][1] + ', ' + t.colors[order[k]][2] + ')');
            });
            ctxHidden.fillStyle = gradient;
            ctxHidden.fillRect(gv[i][0] / 2, gv[i][1] / 2, 30, 30);
        });

        //MAKE PATTERN OUT OF CANVAS AND DRAW
        let pattern = ctx.createPattern(hidden, 'repeat');
        ctx.fillStyle = pattern;
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.restore();
    }

    t.trigger = () => {
        it(t.holes.length,(i)=>{
            t.holes[i].active = !t.holes[i].active;
        });
    }

    t.setup = () => {
        setup(t);
        PLAYER.goToSpawn();
        PLAYER.state = "normal";
        PLAYER.frameCounter = 0;
        PLAYER.health = 3;
        PLAYER.rope = null;
        PLAYER.dashAfterImg = [];
        t.loaded = true;
    }
}

var stage1Data = [
    [
        [480, 10, "origin", "up", 90, colorBlue],
        [480, 950, "win", "down"]
    ],
    [],
    [],
    [100,200]
]

var stage2Data = [
    [
        [950, 700, "origin", "right", 40, colorBlue],
        [480, 950, "win", "down"]
    ],
    [[[[0, 300, 375, 75], [300, -10, 75, 385]]]],
    [],
    [100,200]
]

var stage3Data = [
    [
        [480, 10, "origin", "up", 45, colorBlue],
        [10, 480, "con", "left"],
        [950, 480, "con", "right"],
        [480, 950, "win", "down"]
    ],
    [],
    [],
    [100,200]
]

var stage4Data = [
    [
        [10, 465, "origin", "left", 50, colorRed],
        [950, 465, "end", "right",0,colorRed],
        [480, 10, "origin", "up", 75, colorBlue],
        [480, 950, "win", "down"]
    ],
    [],
    [[900, 200]],
    [100,200]
]

var stage5Data = [
    [
        [480, 10, "origin", "up", 45, colorBlue],
        [10, 480, "con", "left"],
        [950, 480, "con", "right"],
        [480, 950, "win", "down"]
    ],
    [],
    [[500, 900]],
    [100,200]
]

var stage6Data = [
    [
        [480, 10, "origin", "up", 45, colorBlue],
        [10, 425, "con", "left"],
        [950, 505, "con", "right"],
        [425, 950, "win", "down"]
    ],
    [[[[0, 510, 600, 100], [400, 390, 600, 100]]]],
    [[810, 810, "active"]],
    [100,850]
]


var stage7Data = [
    [
        [950, 100, "origin", "right", 70, colorBlue],
        [600, 950, "win", "down"],
        [750, 10, "origin", "up", 15, colorRed],
        [950, 250, "end", "right", 0, colorRed],
        [500, 950, "origin", "down", 50, colorYellow],
        [10, 500, "trigger", "left"]
    ],
    [
        [[[0, 300, 365, 75], [300, -10, 75, 385]]],
        [[[635, 300, 365, 75], [625, -10, 75, 385]],false]
    ],
    [[100, 100, "active"]],
    [100,850]
]


var stage8Data = [
    [
        [250, 10, "origin", "up", 50, colorBlue],
        [950, 300, "con", "right"],
        [10, 450, "con", "left"],
        [950, 800, "win", "right"],
        [500, 950, "origin", "down", 50, colorYellow],
        [10, 600, "trigger", "left"]
    ],
    [
        [[[175, -10, 200, 200], [810, 225, 200, 200]]],
        [[[0, 375, 200, 200], [810, 725, 200, 200]],false]
    ],
    [[900, 650],[100, 200]],
    [300,750]
]

var stage9Data = [
    [
        [10, 300, "origin", "left", 30, colorBlue],
        [10, 400, "win", "left",0, colorPink],
        [950, 550, "origin", "right", 30, colorPink],
        [950, 700, "win", "right"],
        [300, 10, "con", "up"],
        [700, 950, "con", "down"],
        [700, 10, "con", "up"],
        [300, 950, "con", "down"],
        [10, 150, "con", "left"],
        [950, 150, "con", "right"],
        [10, 850, "con", "left"],
        [950, 850, "con", "right"],
    ],
    [],
    [],
    [300,750]
]

var stage11Data = [
    [
        [10, 200, "origin", "left", 40, colorBlue],
        [950, 450, "win", "right"],
        [850, 950, "origin", "down", 40, colorPink],
        [950, 200, "win", "right", 0, colorPink],
        [10, 600, "origin", "left",40, colorYellow],
        [450, 950, "trigger", "down"],
        [100, 950, "trigger", "down"],
        [650, 950, "con", "down"],
        [250, 10, "con", "up"],
        [10, 400, "con", "left"],
        [950, 700, "con", "right"],
        [250, 950, "con", "down"],
        [550, 10, "con", "up"]
    ],
    [
        [[[175, -10, 200, 200],[575, 810, 200, 200],[810, 125, 200, 200]]],
        [[[25, 810, 200, 200], [0, 325, 200, 200],[810, 375, 200, 200]],false]
    ],
    [[525, 450, "active"]],
    [300,750]
]

var stage12Data = [
    [
        [950, 200, "origin", "right", 40, colorBlue],
        [500, 10, "origin", "up", 40, colorPink],
        [350, 10, "win", "up"],
        [10, 700, "win", "left", 0, colorPink],
        [10, 200, "con", "left"],
        [950, 550, "con", "right"],
        [600, 950, "con", "down"],
        [650, 10, "con", "up"],
        [10, 400, "con", "left"],
        [300, 950, "con", "down"],

    ],
    [[[[300, 300, 350, 350]]]],
    [[100, 700, "trooper",{x: 850,y:700}]],
    [800,200]
]

var stage10Data = [
    [
        [10, 650, "origin", "left", 40, colorBlue],
        [600, 10, "origin", "up", 30, colorPink],
        [400, 10, "win", "up"],
        [950, 500, "win", "right", 0, colorPink],
        [950, 700, "origin", "right",40, colorYellow],
        [600, 950, "trigger", "down"],
        [300, 950, "con", "down"],
        [10, 150, "con", "left"],
        [950, 300, "con", "right"],
        [700, 950, "con", "down"],
        [10, 500, "origin", "left", 45, colorRed],
        [500, 950, "end", "down", 0, colorRed],
        [10, 400, "origin", "left", 30, colorRed],
        [300, 10, "end", "up", 0, colorRed],
    ],
    [
        [[[800, -10, 75, 200], [800, 115, 200, 75],[0,75, 200, 200]],],
        [[[0, 800, 200, 75], [125, 800, 75, 200]],false],
    ],
    [[60, 940, "active"],[950,50]],
    [450,450]
]

var genStage = (data)=>{
    let sockets = [];
    let ropes = [];
    let holes = [];
    let enemies = [];
    let solidBodies = [];
    let wins = [];
    let con = null;
    let red = null;
    it(data[0].length, (i)=>{
        let soc = new Socket(data[0][i]);
        if(soc.type == "con"){
            if(con){
                con.setConnection(soc);
                con = null;
            }else{
                con = soc;
            }
        }
        if(soc.type == "origin"){
            if(soc.color != colorRed){
                ropes.push(soc.rope);
            }else if(!red){
                red = soc.rope;
            }
        }else if(soc.type == "win"){
            wins.push(soc);
        }else if(soc.color == colorRed){
            red.attach(soc, soc.conPt);
            red = null;
        }
        solidBodies = solidBodies.concat(soc.hitboxes);
        sockets.push(soc);
    });
    it(data[1].length, (i)=>{
        let hole = genHoles([],data[1][i][1]);
        it(data[1][i][0].length, (j)=>{
            let holeData = data[1][i][0][j];
            hole.holes.push(new Hole(holeData));
        });
        holes.push(hole);
    });
    it(data[2].length, (i)=>{
        enemies.push(new Byter(data[2][i]));
    });
    return new Stage(function(t){
        t.sockets = sockets;
        t.ropes = ropes;
        t.holes = holes;
        t.enemies = enemies;
        PLAYER.spawnPoint = {x: data[3][0], y: data[3][1]}
        t.solidBodies = solidBodies;
        t.wins = wins;
    });
}

var genHoles = (holeList, active = true) => {
    return {
        holes: holeList,
        active: active,
    }
}

function Hole([x, y, w, h]) {
    let t = this;
    t.setVals(x, y, w, h);
    t.points = [];
    let yOffset = 10;
    let sectionLength = 10;
    let divisor = getNextWholeDivisor(t.w, sectionLength);
    let sections = t.w / divisor
    let variableLength = 10;
    it(sections, (i)=>{
        t.points.push([t.x + divisor * (i + 1), t.y + yOffset + variableLength]);
        variableLength = Math.abs(variableLength - 10);
    });
    //right
    divisor = getNextWholeDivisor(t.h, sectionLength);
    sections = t.h / divisor
    variableLength = 10;
    it(sections, (i)=>{
        t.points.push([t.x + t.w - variableLength, t.y + divisor * (i + 1) + yOffset]);
        variableLength = Math.abs(variableLength - 10);
    });
    //bottom
    divisor = getNextWholeDivisor(t.w, sectionLength);
    sections = t.w / divisor
    variableLength = 10;
    it(sections, (i)=>{
        t.points.push([t.x + t.w - divisor * (i + 1), t.y + t.h - variableLength + yOffset]);
        variableLength = Math.abs(variableLength - 10);
    });
    //left
    divisor = getNextWholeDivisor(t.h, sectionLength);
    sections = t.h / divisor
    variableLength = 10;
    it(sections, (i)=>{
        t.points.push([t.x + variableLength, t.y + t.h - divisor * (i+1) + yOffset]);
        variableLength = Math.abs(variableLength - 10);
    });
}

Hole.prototype = Hitbox();