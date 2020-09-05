function genBackground(){
    let totalRows = 27;
    return{
        rows: [],
        init: false,
        update(){
            let t = this;
            if(!t.init){
                for(let i = 0;i<totalRows;i++){
                    t.rows.push(t.row(60+35*i))
                }
                t.init = true;
            }
            let rand = Math.random();
            let activate = true;
            for(let i = 0;i<totalRows;i++){
                if(!t.rows[i].update() && activate){
                    activate = !t.rows[i].attemptActivate(rand)
                }
            }
        },
        row(yPos){
            let totalAnim = 38;
            //let animationFrames = 20;
            return{
                numbers: [],
                animationFrameCounter: 0,
                animationFrames: 0,
                activationProb: 0.1,
                active: false,
                animCounter: 0,
                xPosCounter: 0,
                init: false,
                update()
                {
                    let t = this;
                    if(t.active) {
                        if (!t.init) {
                            t.numbers.push(t.number(17 + t.xPosCounter * 25, yPos, t.animationFrames * 6));
                            t.init = true;
                        }
                        ctx.font = '45px monospace';
                        if (t.animCounter < totalAnim && t.animationFrameCounter > t.animationFrames) {
                            t.animationFrameCounter = 0;
                            t.animCounter++;
                            t.xPosCounter++;
                            if (t.xPosCounter > totalAnim) {
                                t.xPosCounter = 0;
                            }
                            let animXPos = 17 + t.xPosCounter * 25;
                            t.numbers.push(t.number(animXPos, yPos, t.animationFrames * 12));
                        }
                        t.animationFrameCounter++;
                        t.numbers = t.numbers.filter(num => num.draw());
                        if (!t.numbers.length) {
                            t.active = false;
                        }
                    }
                    return t.active;
                },
                attemptActivate(rand){
                    let t = this;
                    if(rand < t.activationProb){
                        t.active = true;
                        t.animationFrames = 5 + Math.round(Math.random()*15);
                        t.xPosCounter = Math.round(Math.random()*(totalAnim/2));
                        t.animCounter = 0;
                        t.animationFrameCounter = 0;
                        t.init = false;
                        t.activationProb = 0.1;
                    }else{
                        t.activationProb += 0.1
                    }
                    return t.active;
                },
                number(xPos, yPos, lifeFrames){
                    //let lifeFrames = 120;
                    return{
                        currentFrames: 0,
                        animNumber: Math.round(Math.random()),
                        draw(){
                            let t = this;
                            let per = t.currentFrames/lifeFrames;
                            let invPer = 1 - per;
                            if(t.currentFrames > 10 && lifeFrames%t.currentFrames == 0){
                                t.animNumber = Math.round(Math.random());
                            }
                            ctx.fillStyle = 'rgba(0, 255, 0, '+ invPer*0.6 +')';
                            ctx.fillText(t.animNumber, xPos, yPos);
                            t.currentFrames++;
                            return t.currentFrames < lifeFrames;
                        }
                    }
                }
            }
        }
    }
}