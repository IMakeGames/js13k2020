var getNextWholeDivisor = (dividend, divisor) => {
    if (dividend % divisor == 0) {
        return divisor;
    } else {
        return getNextWholeDivisor(dividend, divisor - 1);
    }
}

var setNoSmoothing = (context) =>{
    context.imageSmoothingEnabled = false;
    context.webkitImageSmoothingEnabled = false;
    context.mozImageSmoothingEnabled = false;
    context.msImageSmoothingEnabled = false;
    context.oImageSmoothingEnabled = false;
}

function TextPrinter(){
    let t = this;
    t.characterArray = {};
    t.coloredSpriteSheets = {};
    t.sSheet = SPRITE_SHEET;
    let colors = [colorRed,colorBlue,colorGray,colorYellow]
    for(let i = 0;i < colors.length;i++){
        let hidden = document.createElement('canvas');
        hidden.width = 132;
        hidden.height = 61;
        let ctxHidden = hidden.getContext("2d");
        setNoSmoothing(ctxHidden)
        ctxHidden.clearRect(0, 0, 132, 61);
        ctxHidden.fillStyle = "rgba("+colors[i]+", 1)"
        ctxHidden.drawImage(SPRITE_SHEET,0,0);
        ctxHidden.globalCompositeOperation = "source-atop"
        ctxHidden.fillRect(0,0,132,61);
        t.coloredSpriteSheets[colors[i]] = hidden;
    }
    let yInd = 0;
    let xInd = 0;
    for(let i = 97; i < 122;i++ ){
        if(xInd >= 26){
            xInd = 0;
            yInd = 1;
        }
        t.characterArray[String.fromCharCode(i)] = {x: 5*xInd,y: 5*yInd};
        xInd++;
    }
    t.characterArray[" "] = {x:80,y: 56};

    t.drawText = (str, x,y,scale,color)=>{
        let sSheet = SPRITE_SHEET;
        if(color){
            sSheet = t.coloredSpriteSheets[color];
        }
        xInd = 0;
        for(let i = 0; i < str.length;i++){
            ctx.drawImage(sSheet, t.characterArray[str[i]].x, 51 + t.characterArray[str[i]].y ,5,5, x + 6*xInd*scale, y, 5*scale, 5*scale);
            xInd++;
        }
    }
}