let dataPointColors = [
  'rgba(75, 192, 192, 0.5)',
  'rgba(255, 99, 132, 0.5)',
  'rgba(54, 162, 235, 0.5)',
  'rgba(255, 206, 86, 0.5)',
  'rgba(153, 102, 255, 0.5)',
  'rgba(255, 159, 64, 0.5)',
  'rgba(75, 192, 192, 0.5)',
  'rgba(255, 99, 132, 0.5)',
  'rgba(54, 162, 235, 0.5)',
  'rgba(255, 206, 86, 0.5)',
  'rgba(153, 102, 255, 0.5)',
  'rgba(255, 159, 64, 0.5)',
  'rgba(75, 192, 192, 0.5)',
  'rgba(255, 99, 132, 0.5)',
  'rgba(54, 162, 235, 0.5)',
  'rgba(255, 206, 86, 0.5)',
  'rgba(153, 102, 255, 0.5)',
  'rgba(255, 159, 64, 0.5)',
  'rgba(75, 192, 192, 0.5)',
  'rgba(255, 99, 132, 0.5)',
];

let GLOBAL_TRACKER_LIST = {
  chartPeriod: "month",
  dateChartLabel: [],
  dateChartDate: [],
  dateChartAvgLabel: [],
  dateChartAvgData: [],
  groupChartLabel: [],
  groupChartData: [],
  chartDateTime: new Date(),
};

let GLOBAL_TRACKER_PRESENTATION = {
  type: ['bar', 'doughnut', 'line'],
  name: ['chart1', 'chart2', 'chart3'],
  label: ['groupChartLabel', 'groupChartLabel', 'dateChartLabel'],
  data: ['groupChartData', 'groupChartData', 'dateChartDate'] 
}

function getDiscordUserId(){
  var userDiscordId = $("#userDiscordId").text();
  return (userDiscordId === undefined || userDiscordId === "") ? "None": userDiscordId;
}

function getUserId(){
  var currentUserId = $("#currentUserId").text();
  return (currentUserId === undefined || currentUserId === "") ? "None": currentUserId;
}

function getDates(inDate, chartType){
  var startDate = new Date();
  var endDate = new Date();

  if(chartType == 'week'){
    const currentDayOfWeek = inDate.getDay();
    const daysUntilMonday = currentDayOfWeek === 0 ? 6 : currentDayOfWeek - 1;
    const daysUntilSunday = 7 - currentDayOfWeek;
    startDate.setDate(inDate.getDate() - daysUntilMonday);
    endDate.setDate(inDate.getDate() + daysUntilSunday);
  }else{
    const currentMonth = inDate.getMonth();
    const currentYear = inDate.getFullYear();
    startDate = new Date(currentYear, currentMonth, 1);
    endDate = new Date(currentYear, currentMonth + 1, 0);
  }
  
  // console.log("Previous Monday:", startDate);
  // console.log("Next Sunday:", endDate);
  return [startDate, endDate];
}

function getData(){
  var currentUserId = getUserId();
  var todayDate = GLOBAL_TRACKER_LIST.chartDateTime;
  var discordUserId = getDiscordUserId();
  var [startDate, endDate] = getDates(todayDate, GLOBAL_TRACKER_LIST.chartPeriod);
  startDate = formatDateToMMDDYYYY(startDate);
  endDate = formatDateToMMDDYYYY(endDate);
  if (!currentUserId){
    var toastCard = $('#toastBody');
    toastCard.text("Please login");
    $('.toast').toast('show');
    return;
  }
  // console.log("startDate:" + startDate + ". endDate" + endDate);
  $.ajax({
    type: 'post',
    dataType: "json",
    url: "/tracker/",
    data: {
      'postType': 'graphView',
      'startDate': startDate,
      'endDate': endDate,
      'discordUserId': discordUserId,
      'currentUserId': currentUserId
    },
    headers: { "X-CSRFToken": csrftoken },
  }).done(function(result) {
    configureDateChart(result);
  });
}

function formatDate(date) {
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const year = date.getFullYear();
  const dayOfWeek = daysOfWeek[date.getDay()];

  return `${dayOfWeek}, ${month.toString().padStart(2, '0')}/${day.toString().padStart(2, '0')}/${year}`;
}

function formatDateToMMDDYYYY(date) {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const year = date.getFullYear();
  return `${month}-${day}-${year}`;
}

function initialChartData(){
  var todayDate = GLOBAL_TRACKER_LIST.chartDateTime;
  var discordUserId = getDiscordUserId();
  const [startDate, endDate] = getDates(todayDate, GLOBAL_TRACKER_LIST.chartPeriod);
  getData(formatDateToMMDDYYYY(startDate), formatDateToMMDDYYYY(endDate), discordUserId);
}

document.addEventListener('DOMContentLoaded', function() {
  initialChartData();
});

// Button event listeners
document.getElementById('viewByWeekBtn').addEventListener('click', function() {
  GLOBAL_TRACKER_LIST.chartPeriod = "week";
  GLOBAL_TRACKER_LIST.chartDateTime = new Date();
  getData();
});

document.getElementById('viewByMonthBtn').addEventListener('click', function() {
  GLOBAL_TRACKER_LIST.chartPeriod = "month";
  GLOBAL_TRACKER_LIST.chartDateTime = new Date();
  getData();
});

document.getElementById('prevBtn').addEventListener('click', function() {
  if(GLOBAL_TRACKER_LIST.chartPeriod == 'week'){
    GLOBAL_TRACKER_LIST.chartDateTime = new Date(GLOBAL_TRACKER_LIST.chartDateTime - 7 * 24 * 60 * 60 * 1000);
  }else{
    GLOBAL_TRACKER_LIST.chartDateTime = new Date( GLOBAL_TRACKER_LIST.chartDateTime.getFullYear(),  GLOBAL_TRACKER_LIST.chartDateTime.getMonth() - 1,  GLOBAL_TRACKER_LIST.chartDateTime.getDate());
  }
  getData();
});

document.getElementById('nextBtn').addEventListener('click', function() {
  if (GLOBAL_TRACKER_LIST.chartPeriod == 'week'){
    GLOBAL_TRACKER_LIST.chartDateTime = new Date(GLOBAL_TRACKER_LIST.chartDateTime + 7 * 24 * 60 * 60 * 1000);
  }else{
    GLOBAL_TRACKER_LIST.chartDateTime = new Date( GLOBAL_TRACKER_LIST.chartDateTime.getFullYear(),  GLOBAL_TRACKER_LIST.chartDateTime.getMonth() + 1,  GLOBAL_TRACKER_LIST.chartDateTime.getDate());
  }
  getData();
});

function clearAllChartData(){
  GLOBAL_TRACKER_LIST.dateChartDate.length = 0;
  GLOBAL_TRACKER_LIST.dateChartLabel.length = 0;
  GLOBAL_TRACKER_LIST.groupChartData.length = 0;
  GLOBAL_TRACKER_LIST.groupChartLabel.length = 0;
  GLOBAL_TRACKER_LIST.dateChartAvgLabel.length = 0;
  GLOBAL_TRACKER_LIST.dateChartAvgData.length = 0;
}

function configureDateChart(ret){
  var userData = ret['userData'];
  var avgData = ret['avgData'];
  var chartDateDict = {};
  var chartDateAvgDict = {};
  var chartTypeDict = {};

  // console.log(ret);
  // user Data
  for (var i = 0; i < userData.length; i++) {
    var studyDate = userData[i]['studyDate'];
    var studyTime = userData[i]['studyTime'];
    var studyTopic = userData[i]['studyTopic'];
    // date dict
    if (!chartDateDict.hasOwnProperty(studyDate)) {
      chartDateDict[studyDate] = studyTime;
    } else {
      chartDateDict[studyDate] = +studyTime;
    }
    // type dict
    if (!chartTypeDict.hasOwnProperty(studyTopic)) {
      chartTypeDict[studyTopic] = studyTime;
    } else {
      chartTypeDict[studyTopic] += studyTime;
    }
  }

  // avg Data
  for (var i=1; i<avgData.length; i++){
    var studyDate = avgData[i]['studyDate'];
    var studyTime = avgData[i]['studyTime'];
    var studyTopic = avgData[i]['studyTopic'];
    if (!chartDateAvgDict.hasOwnProperty(studyDate)) {
      chartDateAvgDict[studyDate] = studyTime;
    } else {
      chartDateAvgDict[studyDate] = +studyTime;
    }
  }

  // console.log(chartDateDict);
  clearAllChartData();
  // date type
  for (var key in chartDateDict) {
    GLOBAL_TRACKER_LIST.dateChartLabel.push(key);
    GLOBAL_TRACKER_LIST.dateChartDate.push(chartDateDict[key]);
  }

  // avg type
  for (var key in chartDateAvgDict) {
    GLOBAL_TRACKER_LIST.dateChartAvgLabel.push(key);
    GLOBAL_TRACKER_LIST.dateChartAvgData.push(chartDateAvgDict[key]);
  }
  // type
  for (var key in chartTypeDict) {
    GLOBAL_TRACKER_LIST.groupChartLabel.push(key);
    GLOBAL_TRACKER_LIST.groupChartData.push(chartTypeDict[key]);
  } 
  updateAllChart();
}

function updateAllChart(){
  for (var i=0; i<GLOBAL_TRACKER_PRESENTATION.label.length; i++){
    updateChart(GLOBAL_TRACKER_PRESENTATION.type[i], GLOBAL_TRACKER_PRESENTATION.name[i], 
      GLOBAL_TRACKER_PRESENTATION.label[i], GLOBAL_TRACKER_PRESENTATION.data[i]);
  }
}

// Function to update the chart based on the chart type and data
function updateChart(chartType, chartName, labelName, dataName) {
  var label = GLOBAL_TRACKER_LIST[labelName];
  var data = GLOBAL_TRACKER_LIST[dataName];
  // console.log("chartType is: " + chartType);
  
  var ctx = document.getElementById(chartName).getContext('2d');
  var existingChart = Chart.getChart(ctx);
  if (existingChart) {
    existingChart.destroy();
  }

  if (chartType == 'line'){
    var myChart = new Chart(ctx, {
      type: chartType,
      data: {
        labels: label, // Use labels for line1
        datasets: [
          {
            label: 'Myself',
            data: data,
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 3,
          },
          {
            label: 'Avg',
            data: GLOBAL_TRACKER_LIST.dateChartAvgData,
            borderColor: 'rgba(255, 99, 132, 1)',
            borderWidth: 3,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    });
  }else{
    var myChart = new Chart(ctx, {
      type: chartType,
      data: {
        labels: label,
        datasets: [{
          label: 'Study Time (in minutes)',
          data: data,
          backgroundColor: dataPointColors,
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 3,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true
          }
        }
      },
    });
  }
}
