var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext("2d");
var imgdeck = document.getElementById("imgdeck");
canvas.width = 600;
canvas.height = 600;

var turno = 1;
var actplayer = 1;

ctx.fillStyle = "green";
ctx.fillRect(0,0,canvas.width,canvas.height);

const deck = 3;

const drw = document.getElementById('draw');
console.log(drw);
drw.addEventListener("click", ()=>{console.log('draw');});

const drwd = document.getElementById('drawdisc');
console.log(drwd);
drwd.addEventListener("click", ()=>{console.log('draw from discards');});

const place = document.getElementById('place');
console.log(place)
place.addEventListener("click", ()=>{console.log('place');});
