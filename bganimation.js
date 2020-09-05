function genBackground(){
    let totalRows = 27;
    return{
        rows: [],
        init: false,
        update(){
            let t = this;
            if(!t.init){
                for(let i = 0;i<totalRows;i++){
                    t.rows.push(t.row(60+35*i, 20))
                }
                t.init = true;
            }
            t.rows = t.rows.filter(r => r.update());
        },
        row(yPos, animationFrames){
            let totalAnim = 38;
            //let animationFrames = 20;
            return{
                numbers: [],
                animationFrameCounter: 0,
                animCounter: 0,
                xPosCounter: 0,
                init: false,
                update()
                {
                    let t = this;
                    if(!t.init){
                        t.numbers.push(t.number(17, yPos, animationFrames*6));
                        t.init = true;
                    }
                    ctx.font = '45px monospace';
                    if (t.animCounter < totalAnim && t.animationFrameCounter > animationFrames) {
                        t.animationFrameCounter = 0;
                        t.animCounter++;
                        t.xPosCounter++;
                        if (t.xPosCounter > 38) {
                            t.xPosCounter = 0;
                        }
                        let animXPos = 17 + t.xPosCounter * 25;
                        t.numbers.push(t.number(animXPos, yPos, animationFrames*6));
                    }
                    t.animationFrameCounter++;
                    t.numbers = t.numbers.filter(num => num.draw());

                    return t.numbers.length > 0;
                },
                number(xPos, yPos, lifeFrames){
                    //let lifeFrames = 120;
                    return{
                        currentFrames: 0,
                        animNumber: Math.round(Math.random()),
                        draw(){
                            let t = this;
                            console.log(lifeFrames);
                            let per = t.currentFrames/lifeFrames;
                            let invPer = 1 - per;
                            if(t.currentFrames > 10 && lifeFrames%t.currentFrames == 0){
                                t.animNumber = Math.round(Math.random());
                            }
                            ctx.fillStyle = 'rgba(0, 255, 0, '+ invPer +')';
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