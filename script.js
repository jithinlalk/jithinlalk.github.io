var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
var hourBellCounter = 0;
var alarmCounter = 0;
var audioTick = new Audio("Audios/tick.mp3");
var audioBell = new Audio("Audios/bell.mp3");
var audioAlarm = new Audio("Audios/alarm.mp3");
var alarm_audio_length = 29;
var soundCheckbox = document.getElementById("sound");
var radius;

var background = new Image();
background.src = "Images/clock_frame.png";

// Switch between alarm gif and canvas
function displayAlarmCanvas(alarmStyle, canvasStyle) {
  document.getElementById("alarmImage").style.display = alarmStyle;
  document.getElementById("canvasDiv").style.display = canvasStyle;
}

function Orientation(orientLandscape) {
  if (orientLandscape.matches) {
    // If media query matches
    canvas.width = "250";
    canvas.height = "250";
  } else {
    canvas.width = "150";
    canvas.height = "150";
  }
  radius = canvas.height / 2;
  ctx.translate(radius, radius);
  radius = radius * 0.9;
}

// Set canvas size corresponding to orientation
var orientLandscape = window.matchMedia("(orientation: landscape)");
Orientation(orientLandscape);
orientLandscape.addListener(Orientation);

// Get list of alarms from cookie and display
var alarmList = JSON.parse((document.cookie === "") ? "[]" : document.cookie);
alarmList.forEach(function Alarm(time) {
  var li = document.createElement("LI");
  li.innerHTML = time + '<span onclick="deleteAlarm(this)"' + 'class="close">&times;</span>';
  document.getElementById("alarms").appendChild(li);
});

// Draw clock frame
function drawFrame() {
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, 2 * 3.14);
  ctx.fillStyle = "white";
  ctx.fill();
  ctx.drawImage(background, 0 - canvas.width / 2, 0 - canvas.height / 2, canvas.width, canvas.height);
}

// Draw single hand
function drawHand(ctx, pos, length, width) {
  ctx.beginPath();
  ctx.lineWidth = width;
  ctx.lineCap = "round";
  ctx.moveTo(0, 0);
  ctx.rotate(pos);
  ctx.lineTo(0, -length);
  ctx.stroke();
  ctx.rotate(-pos);
}

// Draw all hands
function drawTime(ctx, radius) {
  var now = new Date();
  var hour = now.getHours();
  var minute = now.getMinutes();
  var second = now.getSeconds();

  // Update hourBellCounter in every hour
  if (0 === minute && 0 === second) {
    hourBellCounter = ((hour - 1) % 12) + 1;
  }

  // Check if any alarm is set in every minute
  if (0 === second) {
    alarmList.forEach(function checkAlarm(item) {
      var time = item.split(":");
      if (parseInt(time[0]) === hour && parseInt(time[1]) === minute) {
        audioAlarm.play();
        alarmCounter = alarm_audio_length;
      }
    });
  }

  // Display date and time
  document.getElementById("time").innerHTML = now;

  // Convert hour from 24-hour format to 12-hour format
  hour = hour % 12;
  hour = (hour * Math.PI) / 6 + (minute * Math.PI) / (6 * 60) + (second * Math.PI) / (360 * 60);
  drawHand(ctx, hour, radius * 0.5, radius * 0.07);

  //minute
  minute = (minute * Math.PI) / 30 + (second * Math.PI) / (30 * 60);
  drawHand(ctx, minute, radius * 0.8, radius * 0.07);

  // second
  second = (second * Math.PI) / 30;
  drawHand(ctx, second, radius * 0.9, radius * 0.02);

  // Check if muted or not
  if (soundCheckbox.checked) {
    if (alarmCounter > 0) {
      // If alarm is playing hide canvas and display alarm gif
      displayAlarmCanvas("block", "none");
      alarmCounter--;
    } else if (hourBellCounter > 0) {
      displayAlarmCanvas("none", "block");
      // Play hour bell
      audioBell.play();
      hourBellCounter--;
    } else {
      displayAlarmCanvas("none", "block");
      // Play tick
      audioTick.play();
    }
  } else {
    displayAlarmCanvas("none", "block");

    // If muted stop alarm and reset hourBellCounter and alarmCounter
    audioAlarm.pause();
    audioAlarm.currentTime = 0;
    hourBellCounter = 0;
    alarmCounter = 0;
  }
}

// Mute/unmute sound
function sound() {
  // Get the status text
  var text = document.getElementById("text");

  // Change the status text
  if (soundCheckbox.checked) {
    text.innerHTML = "ON";
  } else {
    text.innerHTML = "OFF";
  }
}

function playSound(play) {
  document.getElementById("body").style.display = "block";
  document.getElementById("playSound").style.display = "none";
  if (play) {
    soundCheckbox.checked = true;
    sound();
  } else {
    soundCheckbox.checked = false;
    sound();
  }
  setInterval(function drawClock() {
    drawFrame();
    drawTime(ctx, radius);
  }, 1000);
}

// Update alarm List on adding or deleting alarm
function updateAlarmList() {
  alarmList = [];
  var ul = document.getElementById("alarms");

  Array.prototype.forEach.call(ul.children, function addToList(child) {
    alarmList.push(child.firstChild.data);
  });

  // Add alarm list to cookie
  var json_str = JSON.stringify(alarmList);
  document.cookie = json_str;
}

// Add new alarm
function addAlarm() {
  var time = document.getElementById("alarmTime").value;

  alarmList.forEach(function Alarm(ti) {
    if (time.trim() === ti.trim()) {
      time = "";
    }
  });

  if (time === "") {
    return;
  }

  // Add new element to HTML alarm list
  var li = document.createElement("LI");
  li.innerHTML =
    time +
    " " +
    '<span onclick="deleteAlarm(this)"' +
    'class="close">&times;</span>';
  document.getElementById("alarms").appendChild(li);
  document.getElementById("alarmTime").value = "";
  updateAlarmList();
}

// Delete alarm
function deleteAlarm(element) {

  if (confirm("Are you sure to delete alarm?")) {
    element.parentNode.parentNode.removeChild(element.parentNode);
    updateAlarmList();
  }

}
