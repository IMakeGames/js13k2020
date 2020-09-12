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
var COLORED_SPRITE_SHEETS = [];
var loadColoredSpriteSheets = ()=>{
    let colors = [colorRed, colorRedAlph, colorBlue, colorBlueAlph, colorYellow, colorYellowAlph];
    for(let i = 0;i < colors.length;i++){
        let hidden = document.createElement('canvas');
        hidden.width = 132;
        hidden.height = 61;
        let ctxHidden = hidden.getContext("2d");
        setNoSmoothing(ctxHidden)
        ctxHidden.clearRect(0, 0, 132, 61);
        let colorString = colors[i];
        let colorL = colorString.split(",");
        if(colorL.length < 4){
            colorString += ",1";
        }
        ctxHidden.fillStyle = "rgba("+colorString+")"
        ctxHidden.drawImage(SPRITE_SHEET,0,0);
        ctxHidden.globalCompositeOperation = "source-atop"
        ctxHidden.fillRect(0,0,132,61);
        COLORED_SPRITE_SHEETS[colors[i]] = hidden;
    }
}

function TextPrinter(){
    let t = this;
    t.sSheet = SPRITE_SHEET;
    let yInd = 0;
    let xInd = 0;
    t.characterArray = [];
    for(let i = 97; i < 122;i++ ){
        if(xInd >= 26){
            xInd = 0;
            yInd = 1;
        }
        t.characterArray[String.fromCharCode(i)] = {x: 5*xInd,y: 5*yInd};
        xInd++;
    }
    t.characterArray['('] = {x:80,y: 5};
    t.characterArray[')'] = {x:85,y: 5};
    t.characterArray['?'] = {x:0, y: 5}

    t.drawText = (str, x,y,scale,color)=>{
        let sSheet = SPRITE_SHEET;
        if(color){
            sSheet = COLORED_SPRITE_SHEETS[color];
        }
        xInd = 0;
        for(let i = 0; i < str.length;i++){
            if(str[i] != ' '){
                ctx.drawImage(sSheet, t.characterArray[str[i]].x, 51 + t.characterArray[str[i]].y ,5,5, x + 6*xInd*scale, y, 5*scale, 5*scale);
                xInd += 1;
            }else{
                xInd += 0.4
            }
            //ctx.drawImage(sSheet, t.characterArray[str[i]].x, 51 + t.characterArray[str[i]].y ,5,5, x + addition, y, 5*scale, 5*scale);
        }
    }

    t.getStrLength = (str, scale)=>{
        let length = 0;
        for(let i = 0; i < str.length;i++){
            if(str[i] != ' '){
                length += 6*scale;
            }else{
                length += 3*scale;
            }
        }
        return length;
    }
}

function optBox(x,y,h,str, callback, color){
    let t = this;
    let w = textProc.getStrLength(str, (h-20)/5) + 10;
    t.setVals(x,y,w,h);
    t.draw = ()=>{
        ctx.strokeStyle= color ? "rgb(" + color +")": '#00c745';
        ctx.lineWidth = 10;
        ctx.strokeRect(x,y,w,h);
        textProc.drawText(str,  x + 10,y+10,(h-20)/5, color);
    }
    t.executeCallback = () =>{
        callback();
    }
}
optBox.prototype = Hitbox();