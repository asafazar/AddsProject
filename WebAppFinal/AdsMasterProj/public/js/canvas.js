var CanvasXSize = 1306;
var CanvasYSize = 905;
var speed = 70;
var scale = 1.05;
var y = -4.5;

var dx = 0.75;
var imgWidth;
var imgHeight;
var x = 0;
var clearX;
var clearY;
var ctx;
var already_loaded_once = false;

function LoadCanvas() {
    img = document.getElementById('canvas-image');
    imgWidth = img.width*scale;
    imgHeight = img.height*scale;
    if (imgWidth > CanvasXSize) {
        x = CanvasXSize-imgWidth;
    }
    if (imgWidth > CanvasXSize) {
        clearX = imgWidth;
    }
    else {
        clearX = CanvasXSize;
    }
    if (imgHeight > CanvasYSize) {
        clearY = imgHeight;
    }
    else {
        clearY = CanvasYSize;
    }
    ctx = document.getElementById('welcome-canvas').getContext('2d');

    if (already_loaded_once == false) {
        setInterval(draw, speed);
    }
    already_loaded_once = true;
}

function draw() {
    ctx.clearRect(0,0,clearX,clearY);
    if (imgWidth <= CanvasXSize) {
        if (x > (CanvasXSize)) {
            x = 0;
        }
        if (x > (CanvasXSize-imgWidth)) {
            ctx.drawImage(img,x-CanvasXSize+1,y,imgWidth,imgHeight);
        }
    }
    else {
        if (x > (CanvasXSize)) {
            x = CanvasXSize-imgWidth;
        }
        if (x > (CanvasXSize-imgWidth)) {
            ctx.drawImage(img,x-imgWidth+1,y,imgWidth,imgHeight);
        }
    }
    ctx.drawImage(img,x,y,imgWidth,imgHeight);
    x += dx;
}