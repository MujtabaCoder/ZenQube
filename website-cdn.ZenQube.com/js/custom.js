function checkWorkingHours() {
  var now = new Date();
  var hours = now.getUTCHours() + 5; // Add 5 hours for Indian time zone offset
  var minutes = now.getUTCMinutes() + 30; // Add 30 minutes for Indian time zone offset

  // Adjust hours if minutes exceed 60
  if (minutes >= 60) {
    hours += 1;
    minutes -= 60;
  }

  // Define working hours (in 24-hour format)
  var startHour = 11; // 11:00 AM
  var endHour = 18; // 6:00 PM

  // Check if current time is within working hours
  if (hours > startHour || (hours == startHour && minutes >= 0)) {
    if (hours < endHour || (hours == endHour && minutes <= 0)) {
      document.getElementById("call-working").style.display = "none";
      return;
    }
  }

  // If not within working hours, hide the message
  document.getElementById("call-working").style.display = "flex";
}

// Call the function initially
checkWorkingHours();

// Call the function every minute to update the display
setInterval(checkWorkingHours, 60000); // 60000 milliseconds = 1 minute