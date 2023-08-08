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
  trackerType: 'chart',
};

let GLOBAL_TRACKER_PRESENTATION = {
  type: ['bar', 'doughnut', 'line'],
  name: ['chart1', 'chart2', 'chart3', 'chart4'],
  label: ['groupChartLabel', 'groupChartLabel', 'dateChartLabel'],
  data: ['groupChartData', 'groupChartData', 'dateChartDate'],
  startDate: '1/1/2020',
  endDate: '1/1/2020'
}

function compareSecondElement(a, b) {
  return b[1] - a[1];
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
  var startDate = new Date(inDate);
  var endDate = new Date(inDate);

  if(chartType == 'week'){
    const currentDayOfWeek = inDate.getDay();
    const daysUntilMonday = (currentDayOfWeek + 6) % 7;
    const daysUntilSunday = (currentDayOfWeek === 0) ? 0 : (7 - currentDayOfWeek);
    startDate.setDate(inDate.getDate() - daysUntilMonday);
    endDate.setDate(inDate.getDate() + daysUntilSunday);
  }else{
    const currentMonth = inDate.getMonth();
    const currentYear = inDate.getFullYear();
    startDate = new Date(currentYear, currentMonth, 1);
    endDate = new Date(currentYear, currentMonth + 1, 0);
  }
  // console.log("In date:", inDate);
  // console.log("Previous Monday:", startDate);
  // console.log("Next Sunday:", endDate);
  GLOBAL_TRACKER_PRESENTATION.startDate = startDate;
  GLOBAL_TRACKER_PRESENTATION.endDate = endDate;

  return [startDate, endDate];
}

function loadRank(){
  destroyAllCharts();
  GLOBAL_TRACKER_LIST.chartType = 'rank';
  var todayDate = GLOBAL_TRACKER_LIST.chartDateTime;
  var [startDate, endDate] = getDates(todayDate, GLOBAL_TRACKER_LIST.chartPeriod);
  startDate = formatDateToMMDDYYYY(startDate);
  endDate = formatDateToMMDDYYYY(endDate);
  $.ajax({
    type: 'post',
    dataType: "json",
    url: "/tracker/",
    data: {
      'postType': 'rankView',
      'startDate': startDate,
      'endDate': endDate,
    },
    headers: { "X-CSRFToken": csrftoken },
  }).done(function(result) {
    updateRankChart(result);
  });
}

function getData(){
  GLOBAL_TRACKER_LIST.chartType = 'chart';
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
  var currentUserId = $("#currentUserId").text();
  // console.log(currentUserId);
  if (currentUserId != 'None'){
    getData(formatDateToMMDDYYYY(startDate), formatDateToMMDDYYYY(endDate), discordUserId);
  }else{
    var toastCard = $('#toastBody');
    toastCard.text("Please login");
    $('.toast').toast('show');
    return;
  }
}

function loadStudy(){
  destroyAllCharts();
  initialChartData();
}

document.addEventListener('DOMContentLoaded', function() {
  initialChartData();
});

// Button event listeners
document.getElementById('viewByWeekBtn').addEventListener('click', function() {
  GLOBAL_TRACKER_LIST.chartPeriod = "week";
  GLOBAL_TRACKER_LIST.chartDateTime = new Date();
  if (GLOBAL_TRACKER_LIST.chartType == 'rank'){
    loadRank();
  }else{
    getData();
  }
});

document.getElementById('viewByMonthBtn').addEventListener('click', function() {
  GLOBAL_TRACKER_LIST.chartPeriod = "month";
  GLOBAL_TRACKER_LIST.chartDateTime = new Date();
  if (GLOBAL_TRACKER_LIST.chartType == 'rank'){
    loadRank();
  }else{
    getData();
  }
});

document.getElementById('prevBtn').addEventListener('click', function() {
  // console.log('pre today date:', GLOBAL_TRACKER_LIST.chartDateTime);
  if(GLOBAL_TRACKER_LIST.chartPeriod == 'week'){
    GLOBAL_TRACKER_LIST.chartDateTime.setDate(GLOBAL_TRACKER_LIST.chartDateTime.getDate() - 7);
  }else{
    GLOBAL_TRACKER_LIST.chartDateTime = new Date( GLOBAL_TRACKER_LIST.chartDateTime.getFullYear(),  GLOBAL_TRACKER_LIST.chartDateTime.getMonth() - 1,  GLOBAL_TRACKER_LIST.chartDateTime.getDate());
  }
  // console.log('next today date after:', GLOBAL_TRACKER_LIST.chartDateTime);
  // console.log("TRACKER TIME:" + GLOBAL_TRACKER_LIST.chartDateTime);
  if (GLOBAL_TRACKER_LIST.chartType == 'rank'){
    loadRank();
  }else{
    getData();
  }
});

document.getElementById('nextBtn').addEventListener('click', function() {
  // console.log('next today date:', GLOBAL_TRACKER_LIST.chartDateTime);
  if (GLOBAL_TRACKER_LIST.chartPeriod == 'week'){
    GLOBAL_TRACKER_LIST.chartDateTime.setDate(GLOBAL_TRACKER_LIST.chartDateTime.getDate() + 7);
  }else{
    GLOBAL_TRACKER_LIST.chartDateTime = new Date( GLOBAL_TRACKER_LIST.chartDateTime.getFullYear(),  GLOBAL_TRACKER_LIST.chartDateTime.getMonth() + 1,  GLOBAL_TRACKER_LIST.chartDateTime.getDate());
  }
  // console.log('next today date after:', GLOBAL_TRACKER_LIST.chartDateTime);
  if (GLOBAL_TRACKER_LIST.chartType == 'rank'){
    loadRank();
  }else{
    getData();
  }
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
  const userData = ret['userData'];
  const avgData = ret['avgData'];
  const chartDateDict = {};
  const chartDateAvgDict = {};
  const chartDateAvgCnt = {};
  const chartTypeDict = {};

  // console.log(ret);
  // user Data
  for (const item of userData) {
    const studyDate = item.studyDate;
    const studyTime = item.studyTime;
    const studyTopic = item.studyTopic;
    // date dict
    if (chartDateDict[studyDate]) {
      chartDateDict[studyDate] += studyTime;
    } else {
      chartDateDict[studyDate] = studyTime;
    }
    // type dict
    if (chartTypeDict[studyTopic]) {
      chartTypeDict[studyTopic] += studyTime;
    } else {
      chartTypeDict[studyTopic] = studyTime;
    }
  }

  // avg Data
  for (const item of avgData){
    const studyDate = item.studyDate;
    const studyTime = item.studyTime;
    if (chartDateAvgDict[studyDate]) {
      chartDateAvgDict[studyDate] += studyTime;
      chartDateAvgCnt[studyDate] += 1;
    } else {
      chartDateAvgDict[studyDate] = studyTime;
      chartDateAvgCnt[studyDate] = 1
    }
  }
  // console.log(chartDateDict);
  // console.log(Object.keys(chartDateAvgDict).length);
  // console.log(Object.keys(chartDateAvgCnt).length);
  clearAllChartData();

// Convert the keys (datetime strings) to timestamps and sort them in descending order
  const sortedKeys = Object.keys(chartDateAvgDict)
    .map(key => new Date(key).getTime()) // Convert to timestamps
    .sort((a, b) => a - b) // Sort in descending order

  // avg type
  for (const timestamp of sortedKeys) {
    // console.log(key);
    const key = new Date(timestamp).toISOString().slice(0, 10);
    GLOBAL_TRACKER_LIST.dateChartAvgLabel.push(key);
    GLOBAL_TRACKER_LIST.dateChartAvgData.push(chartDateAvgDict[key]/chartDateAvgCnt[key])
    GLOBAL_TRACKER_LIST.dateChartLabel.push(key);
    if(chartDateDict[key]){
      GLOBAL_TRACKER_LIST.dateChartDate.push(chartDateDict[key]);
    }else{
      GLOBAL_TRACKER_LIST.dateChartDate.push(0);
    }
  }
  // console.log(GLOBAL_TRACKER_LIST.dateChartAvgLabel);
  // console.log(GLOBAL_TRACKER_LIST.dateChartAvgData);
  // console.log(chartDateAvgDict);
  // type
  for (const key in chartTypeDict) {
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

function destroyAllCharts() {
  
  for (let i=0; i<GLOBAL_TRACKER_PRESENTATION.name.length; i++){
    var ctx = document.getElementById(GLOBAL_TRACKER_PRESENTATION.name[i]).getContext('2d');
    var existingChart = Chart.getChart(ctx);
    if (existingChart) {
      existingChart.destroy();
    }
  }
}

// Function to update the chart based on the chart type and data
function updateChart(chartType, chartName, labelName, dataName) {
  var label = GLOBAL_TRACKER_LIST[labelName];
  var data = GLOBAL_TRACKER_LIST[dataName];
  const reportName = 'Report Period (mins): ' + formatDateToMMDDYYYY(GLOBAL_TRACKER_PRESENTATION.startDate) + ' to ' + formatDateToMMDDYYYY(GLOBAL_TRACKER_PRESENTATION.endDate);
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
        labels: GLOBAL_TRACKER_LIST.dateChartAvgLabel, // Use labels for line1
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
        plugins: {
          title: {
            display: true,
            text: reportName, 
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
          borderWidth: 2,
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

function updateRankChart(ret){
  // console.log(ret);
  label = [];
  data = [];
  ret.sort(compareSecondElement);
  for (let i=0; i < ret.length; i++) {
    label.push(ret[i][0]);
    data.push(ret[i][1]);
  }

  const reportName = 'Top 10 (mins) - Report Period: ' + formatDateToMMDDYYYY(GLOBAL_TRACKER_PRESENTATION.startDate) + ' to ' + formatDateToMMDDYYYY(GLOBAL_TRACKER_PRESENTATION.endDate);
  const rank = document.getElementById('chart4').getContext('2d');
  const rankChart = new Chart(rank, {
    type: 'bar',
    data: {
      labels: label.slice(0, 10),
      datasets: [{
          axis: 'y',
          label: reportName,
          data: data.slice(0, 10),
          fill: false,
          backgroundColor: dataPointColors,
          borderWidth: 2
        }],
    },
    options: {
      indexAxis: 'y',
    }
  });
}
