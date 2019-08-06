const CANVAS_WIDTH = 500;
const CANVAS_HEIGHT = 500;
const CANVAS_CENTER_X = CANVAS_WIDTH/2;
const CANVAS_CENTER_Y = CANVAS_HEIGHT/2;
const RADIUS = 200;
const PI = Math.PI;
const ALARM_AUDIO_LENGTH = 29;

var canvas = document.getElementById("canvas");
var context = canvas.getContext("2d");
// Counter for hour bell and alarm
var hourBellCounter = 0;
var alarmCounter = 0;
// Initialize audio objects
var audioTick = new Audio("tick.mp3");
var audioBell = new Audio("bell.mp3");
var audioAlarm = new Audio("alarm.mp3");
// Array for storing list of alarms
var alarmList = [];
// Checkbox for mute/unmute
var soundCheckbox = document.getElementById("sound");

// Change canvas origin to center
context.translate(CANVAS_CENTER_X, CANVAS_CENTER_Y);

// Set clock frame
var background = new Image();
background.src = "clock_frame.png";

// Run funtion 'drawClock' in every second
setInterval(function drawClock() {
    drawFrame();
    drawAllHands();
}, 1000);

// Draw clock frame
function drawFrame() {
    // Set white background
    context.beginPath();
    context.arc(0, 0, RADIUS, 0, 2*PI);
    context.fillStyle = "white";
    context.fill();

    // Set background image
    context.drawImage(background, 0-CANVAS_CENTER_X, 0-CANVAS_CENTER_Y,
                      CANVAS_WIDTH, CANVAS_HEIGHT);
}

// Calculate time and draw all hands
function drawAllHands() {
    var date = new Date();
    var hour = date.getHours();
    var minute = date.getMinutes();
    var second = date.getSeconds();

    // Update hourBellCounter in every hour
    if(0===minute && 0===second) {
        hourBellCounter = ((hour-1)%12)+1;
    }

    // Check if any alarm is set in every minute
    if(0===second) {
        alarmList.forEach(function checkAlarm(item) {
            var time = item.split(":");
            if(parseInt(time[0])===hour && parseInt(time[1])===minute){
                audioAlarm.play();
                alarmCounter = ALARM_AUDIO_LENGTH;
            }
        });
    }


    // Display date and time
    document.getElementById("time").innerHTML = date;

    // Draw hour hand
    hour = hour%12;
    hour = (hour*PI/6) + (minute*PI/360) + (second*PI/21600);
    drawHand("black", hour, RADIUS*0.5, RADIUS*0.07);

    // Draw minute hand
    minute = (minute*PI/30) + (second*PI/1800);
    drawHand("black", minute, RADIUS*0.8, RADIUS*0.07);

    // Draw second hand
    second = (second*PI/30);
    drawHand("red", second, RADIUS*0.9, RADIUS*0.02);

    // Check if muted or not
    if(soundCheckbox.checked) {
        if(alarmCounter>0) {
            // If alarm is playing hide canvas and display alarm gif
            displayAlarmCanvas("block", "none");
            alarmCounter--;
        }else if(hourBellCounter>0) {
            displayAlarmCanvas("none", "block");
            // Play hour bell
            audioBell.play();
            hourBellCounter--;
        }else {
            displayAlarmCanvas("none", "block");
            audioTick.play();
        }
    }else {
        displayAlarmCanvas("none", "block");

    // If muted stop alarm and reset hourBellCounter and alarmCounter
    audioAlarm.pause();
    audioAlarm.currentTime = 0;
    hourBellCounter = 0;
    alarmCounter = 0;
    }
}

// Switch between alarm gif and canvas
function displayAlarmCanvas(alarmStyle, canvasStyle) {
    document.getElementById("alarmImage").style.display = alarmStyle;
    document.getElementById("canvas").style.display = canvasStyle;
}

// Draw hand
function drawHand(color, angle, length, width) {
    context.beginPath();
    context.lineWidth = width;
    context.lineCap = "round";
    context.moveTo(0, 0);
    context.rotate(angle);
    context.lineTo(0, -length);
    context.strokeStyle = color;
    context.stroke();
    context.rotate(-angle);
}

// Mute/unmute sound
function sound() {
    // Get the status text
    var text = document.getElementById("text");

    // If the checkbox is checked display the status text
    if(soundCheckbox.checked) {
        text.innerHTML = "ON";
    }else {
        text.innerHTML = "OFF";
    }
}

// Add new alarm
function addAlarm() {
    var time = document.getElementById("alarmTime").value;
    if(time === ""){
        return;
    }

    // Add new element to HTML alarm list
    var li = document.createElement("LI");
    li.innerHTML = time+" "+"<span onclick=\"deleteAlarm(this)\""+
                   "class=\"close\">&times;</span>";
    document.getElementById("alarms").appendChild(li);
	document.getElementById("alarmTime").value = "";
    updateAlarmList();
}

// Delete alarm
function deleteAlarm(t) {
    t.parentNode.parentNode.removeChild(t.parentNode);
    updateAlarmList();
}

// Update alarm List on adding or deleting alarm
function updateAlarmList() {
    alarmList = [];
    var ul = document.getElementById("alarms");

    Array.prototype.forEach.call(ul.children, function addToList(child){
        alarmList.push(child.firstChild.data);
    });
}
