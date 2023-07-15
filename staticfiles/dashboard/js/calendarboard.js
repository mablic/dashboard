let currentMonth;
let currentYear;
// Initial generation of the calendar
const currentDate = new Date();

function formatDate(year, month, day){
  const formattedDate = `${month}/${day}/${year}`;
  return formattedDate;
}

// Function to generate the calendar view
function generateCalendar(year, month) {
  // Clear the calendar body
  const calendarBody = document.getElementById('calendarBody');
  calendarBody.innerHTML = '';

  // Set the current month heading
  const currentMonthElement = document.getElementById('currentMonth');
  currentMonthElement.textContent = `${getMonthName(month)} ${year}`;

  // Get the first day of the month
  var startDate = new Date(year, month, 1);
  var endDate = new Date(year, month + 1, 0);
  const firstDay = startDate.getDay();
  // Get the number of days in the month
  const totalDays = endDate.getDate();
  var userDiscordId = $("#userDiscordId").text();

  startDate = formatDate(startDate.getFullYear(), String(startDate.getMonth()+1).padStart(2, '0'), String(startDate.getDate()).padStart(2, '0'))
  endDate = formatDate(endDate.getFullYear(), String(endDate.getMonth()+1).padStart(2, '0'), String(endDate.getDate()).padStart(2, '0'))

  // console.log(startDate)
  // Get check-in data from the database
  $.ajax({
    type: 'GET',
    dataType: 'json',
    url: '/dashboard/',
    data: {
      'startDate': startDate,
      'endDate': endDate,
      'userDiscordId': userDiscordId,
      'currentView': 'calendarView',
    },
    success: function(ret) {
      // console.log(ret);
      // Generate the calendar days
      let dayCounter = 1;
      for (let week = 0; week < 6; week++) {
        for (let dayOfWeek = 0; dayOfWeek < 7; dayOfWeek++) {
          if (week === 0 && dayOfWeek < firstDay) {
            // Generate empty days before the start of the month
            const emptyDay = document.createElement('div');
            emptyDay.classList.add('calendar-day');
            calendarBody.appendChild(emptyDay);
          } else if (dayCounter <= totalDays) {
            // Generate days of the month
            const calendarDay = document.createElement('div');
            calendarDay.classList.add('calendar-day');

            const dayNumber = document.createElement('span');
            dayNumber.classList.add('calendar-day-number');
            dayNumber.textContent = dayCounter;
            calendarDay.appendChild(dayNumber);

            const notesList = document.createElement('ul');
            notesList.classList.add('calendar-notes');
            for(var i=0; i<ret.length; i++){
              // console.log("Day Counter is:" + dayCounter + ". Current day is:" + ret[i][0]);
              if(dayCounter == ret[i][0]){
                for (var j=0; j<ret[i][1].length; j++){
                  // console.log("LeetCode value is:" + ret[i][1][j]);
                  notesList.innerHTML = notesList.innerHTML + 
                  '<li><a target="_blank" href=' + ret[i][2][j] + '>' + ret[i][1][j] + '</a></li>';
                }
                break;
              }
            }
            calendarDay.appendChild(notesList);
            calendarBody.appendChild(calendarDay);

            dayCounter++;
          }
        }
        // Stop generating days if we exceed the total days in the month
        if (dayCounter > totalDays) {
          break;
        }
      }
    },
    error: function(error) {
      // Handle any errors
      console.error(error);
    }
  });
}

// Function to get the name of the month
function getMonthName(month) {
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return monthNames[month];
}

// Event listener for previous month button
document.getElementById('prevMonthBtn').addEventListener('click', function () {
  currentMonth--;
  if (currentMonth < 0) {
    currentMonth = 11;
    currentYear--;
  }
  generateCalendar(currentYear, currentMonth);
});

// Event listener for next month button
document.getElementById('nextMonthBtn').addEventListener('click', function () {
  currentMonth++;
  if (currentMonth > 11) {
    currentMonth = 0;
    currentYear++;
  }
  generateCalendar(currentYear, currentMonth);
});

function calendarView(params) {
  currentMonth = currentDate.getMonth();
  currentYear = currentDate.getFullYear();
  resetAllFilter();
  disableAllButtons();
  var currentUser = $('#currentUser').text();
  if (!currentUser){
    // console.log("NOT IN USER." + currentUser)
    var toastCard = $('#toastBody');
    toastCard.text("Please login");
    $('.toast').toast('show');
    return;
  }
  generateCalendar(currentYear, currentMonth);
}

// Add event listeners to handle hover effect on notes
// Add event listeners to handle hover effect on notes
const notesElements = document.querySelectorAll('.calendar-day .calendar-notes');
notesElements.forEach((notesElement) => {
  notesElement.addEventListener('mouseover', function () {
    this.style.whiteSpace = 'normal';
    this.style.overflow = 'visible';
    this.style.textOverflow = 'unset';
  });

  notesElement.addEventListener('mouseout', function () {
    this.style.whiteSpace = 'nowrap';
    this.style.overflow = 'hidden';
    this.style.textOverflow = 'ellipsis';
  });
});
