var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext("2d");
var imgdeck = document.getElementById("imgdeck");

canvas.width = 600;
canvas.height = 600;

var turno = 1;
var actplayer = 1;

ctx.fillStyle = "green";
ctx.fillRect(0,0,canvas.width,canvas.height);
ctx.drawImage(imgdeck, 335,275,50,64);

const deck = new Deck();

const drw = document.getElementById('draw');
console.log(drw);
drw.addEventListener("click", ()=>{
    console.log('drw clicked');
});