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