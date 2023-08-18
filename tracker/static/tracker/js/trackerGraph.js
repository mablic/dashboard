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
  type: ['bar', 'pie', 'line'],
  name: ['chart1', 'chart2', 'chart3', 'chart4'],
  label: ['groupChartLabel', 'groupChartLabel', 'dateChartLabel'],
  data: ['groupChartData', 'groupChartData', 'dateChartDate'],
  startDate: '1/1/2020',
  endDate: '1/1/2020'
}

function compare_second_element(a, b) {
  return b[1] - a[1];
}

function get_discord_userId(){
  let userDiscordId = $("#userDiscordId").text();
  return (userDiscordId === undefined || userDiscordId === "") ? "None": userDiscordId;
}

function get_userId(){
  let currentUserId = $("#currentUserId").text();
  return (currentUserId === undefined || currentUserId === "") ? "None": currentUserId;
}

function get_dates(inDate, chartType){
  let startDate = new Date(inDate);
  let endDate = new Date(inDate);

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
  GLOBAL_TRACKER_PRESENTATION.startDate = startDate;
  GLOBAL_TRACKER_PRESENTATION.endDate = endDate;

  return [startDate, endDate];
}

function get_data(){
  GLOBAL_TRACKER_LIST.chartType = 'chart';
  let currentUserId = get_userId();
  let todayDate = GLOBAL_TRACKER_LIST.chartDateTime;
  let discordUserId = get_discord_userId();
  let [startDate, endDate] = get_dates(todayDate, GLOBAL_TRACKER_LIST.chartPeriod);
  startDate = format_date_to_MMDDYYYY(startDate);
  endDate = format_date_to_MMDDYYYY(endDate);
  if (!currentUserId){
    let toastCard = $('#toastBody');
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
    configure_date_chart(result);
  });
}

function format_date(date) {
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const year = date.getFullYear();
  const dayOfWeek = daysOfWeek[date.getDay()];

  return `${dayOfWeek}, ${month.toString().padStart(2, '0')}/${day.toString().padStart(2, '0')}/${year}`;
}

function format_date_to_MMDDYYYY(date) {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const year = date.getFullYear();
  return `${month}-${day}-${year}`;
}

function initial_chart_data(){
  let todayDate = GLOBAL_TRACKER_LIST.chartDateTime;
  let discordUserId = get_discord_userId();
  const [startDate, endDate] = get_dates(todayDate, GLOBAL_TRACKER_LIST.chartPeriod);
  let currentUserId = $("#currentUserId").text();
  // console.log(currentUserId);
  if (currentUserId != 'None'){
    get_data(format_date_to_MMDDYYYY(startDate), format_date_to_MMDDYYYY(endDate), discordUserId);
  }else{
    let toastCard = $('#toastBody');
    toastCard.text("Please login");
    $('.toast').toast('show');
    return;
  }
}

function load_study(){
  let goalNAButton = document.getElementById("goalNA");
  goalNAButton.click();
  remove_goal_chart_copies();
  destroy_all_charts();
  initial_chart_data();
}

document.addEventListener('DOMContentLoaded', function() {
  initial_chart_data();
});

// Button event listeners
document.getElementById('viewByWeekBtn').addEventListener('click', function() {
  GLOBAL_TRACKER_LIST.chartPeriod = "week";
  GLOBAL_TRACKER_LIST.chartDateTime = new Date();
  load_rank();
  get_data();
  load_goal_chart();
  // if (GLOBAL_TRACKER_LIST.chartType == 'rank'){
  //   load_rank();
  // }else{
  //   get_data();
  // }
});

document.getElementById('viewByMonthBtn').addEventListener('click', function() {
  GLOBAL_TRACKER_LIST.chartPeriod = "month";
  GLOBAL_TRACKER_LIST.chartDateTime = new Date();
  load_rank();
  get_data();
  load_goal_chart();
  // if (GLOBAL_TRACKER_LIST.chartType == 'rank'){
  //   load_rank();
  // }else{
  //   get_data();
  // }
});

document.getElementById('prevBtn').addEventListener('click', function() {
  // console.log('pre today date:', GLOBAL_TRACKER_LIST.chartDateTime);
  if(GLOBAL_TRACKER_LIST.chartPeriod == 'week'){
    GLOBAL_TRACKER_LIST.chartDateTime.setDate(GLOBAL_TRACKER_LIST.chartDateTime.getDate() - 7);
  }else{
    GLOBAL_TRACKER_LIST.chartDateTime = new Date( GLOBAL_TRACKER_LIST.chartDateTime.getFullYear(),  GLOBAL_TRACKER_LIST.chartDateTime.getMonth() - 1,  GLOBAL_TRACKER_LIST.chartDateTime.getDate());
  }
  load_rank();
  get_data();
  load_goal_chart();
  // console.log('next today date after:', GLOBAL_TRACKER_LIST.chartDateTime);
  // console.log("TRACKER TIME:" + GLOBAL_TRACKER_LIST.chartDateTime);
  // if (GLOBAL_TRACKER_LIST.chartType == 'rank'){
  //   load_rank();
  // }else{
  //   get_data();
  // }
});

document.getElementById('nextBtn').addEventListener('click', function() {
  // console.log('next today date:', GLOBAL_TRACKER_LIST.chartDateTime);
  if (GLOBAL_TRACKER_LIST.chartPeriod == 'week'){
    GLOBAL_TRACKER_LIST.chartDateTime.setDate(GLOBAL_TRACKER_LIST.chartDateTime.getDate() + 7);
  }else{
    GLOBAL_TRACKER_LIST.chartDateTime = new Date( GLOBAL_TRACKER_LIST.chartDateTime.getFullYear(),  GLOBAL_TRACKER_LIST.chartDateTime.getMonth() + 1,  GLOBAL_TRACKER_LIST.chartDateTime.getDate());
  }
  load_rank();
  get_data();
  load_goal_chart();
  // console.log('next today date after:', GLOBAL_TRACKER_LIST.chartDateTime);
  // if (GLOBAL_TRACKER_LIST.chartType == 'rank'){
  //   load_rank();
  // }else{
  //   get_data();
  // }
});

function clear_all_chart_data(){
  GLOBAL_TRACKER_LIST.dateChartDate.length = 0;
  GLOBAL_TRACKER_LIST.dateChartLabel.length = 0;
  GLOBAL_TRACKER_LIST.groupChartData.length = 0;
  GLOBAL_TRACKER_LIST.groupChartLabel.length = 0;
  GLOBAL_TRACKER_LIST.dateChartAvgLabel.length = 0;
  GLOBAL_TRACKER_LIST.dateChartAvgData.length = 0;
}

function configure_date_chart(ret){
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
  clear_all_chart_data();

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
  for (const key in chartTypeDict) {
    GLOBAL_TRACKER_LIST.groupChartLabel.push(key);
    GLOBAL_TRACKER_LIST.groupChartData.push(chartTypeDict[key]);
  } 
  update_all_chart();
}

function update_all_chart(){
  for (let i=0; i<GLOBAL_TRACKER_PRESENTATION.label.length; i++){
    update_chart(GLOBAL_TRACKER_PRESENTATION.type[i], GLOBAL_TRACKER_PRESENTATION.name[i], 
      GLOBAL_TRACKER_PRESENTATION.label[i], GLOBAL_TRACKER_PRESENTATION.data[i]);
  }
}

function destroy_all_charts() {
  
  for (let i=0; i<GLOBAL_TRACKER_PRESENTATION.name.length; i++){
    let ctx = document.getElementById(GLOBAL_TRACKER_PRESENTATION.name[i]).getContext('2d');
    let existingChart = Chart.getChart(ctx);
    if (existingChart) {
      existingChart.destroy();
    }
  }
}

// Function to update the chart based on the chart type and data
function update_chart(chartType, chartName, labelName, dataName) {
  let label = GLOBAL_TRACKER_LIST[labelName];
  let data = GLOBAL_TRACKER_LIST[dataName];
  const reportName = 'Report Period (mins): ' + format_date_to_MMDDYYYY(GLOBAL_TRACKER_PRESENTATION.startDate) + ' to ' + format_date_to_MMDDYYYY(GLOBAL_TRACKER_PRESENTATION.endDate);
  // console.log("chartType is: " + chartType);
  
  let ctx = document.getElementById(chartName).getContext('2d');
  let existingChart = Chart.getChart(ctx);
  if (existingChart) {
    existingChart.destroy();
  }

  if (chartType == 'line'){
    let myChart = new Chart(ctx, {
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
    let myChart = new Chart(ctx, {
      type: chartType,
      data: {
        labels: label,
        datasets: [{
          label: 'Study Time (in minutes)',
          data: data,
          backgroundColor: dataPointColors,
          borderWidth: 2,
        }]
      },
      options: {
        tooltips: {
          enabled: false
        },
        plugins: {
          datalabels: {
            formatter: (value, ctx) => {
              const datapoints = ctx.chart.data.datasets[0].data
              const total = datapoints.reduce((total, datapoint) => total + datapoint, 0)
              const percentage = value / total * 100
              return percentage.toFixed(2) + "%";
            },
            color: '#000000',
          }
        }
      },
      plugins: [ChartDataLabels],
    });
  }
}

function reset_rank_graph(){
  let ctx = document.getElementById('chart4').getContext('2d');
  let existingChart = Chart.getChart(ctx);
  if (existingChart) {
    existingChart.destroy();
  }
}

function load_rank(){
  // destroy_all_charts();
  GLOBAL_TRACKER_LIST.chartType = 'rank';
  let todayDate = GLOBAL_TRACKER_LIST.chartDateTime;
  let [startDate, endDate] = get_dates(todayDate, GLOBAL_TRACKER_LIST.chartPeriod);
  startDate = format_date_to_MMDDYYYY(startDate);
  endDate = format_date_to_MMDDYYYY(endDate);
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
    update_rank_chart(result);
  });
}

function update_rank_chart(ret){
  reset_rank_graph();
  label = [];
  data = [];
  ret.sort(compare_second_element);
  for (let i=0; i < ret.length; i++) {
    label.push(ret[i][0]);
    data.push(ret[i][1]);
  }

  const reportName = 'Top 10 (mins) - Report Period: ' + format_date_to_MMDDYYYY(GLOBAL_TRACKER_PRESENTATION.startDate) + ' to ' + format_date_to_MMDDYYYY(GLOBAL_TRACKER_PRESENTATION.endDate);
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

function load_goal_chart(){
  remove_goal_chart_copies();
  // destroy_all_charts();
  GLOBAL_TRACKER_LIST.chartType = 'goal';
  let todayDate = GLOBAL_TRACKER_LIST.chartDateTime;
  let [goalStartDate, goalEndDate] = get_dates(todayDate, GLOBAL_TRACKER_LIST.chartPeriod);
  let currentUserId = get_userId();
  let discordUserId = get_discord_userId();
  goalStartDate = format_date_to_MMDDYYYY(goalStartDate);
  goalEndDate = format_date_to_MMDDYYYY(goalEndDate);
  $.ajax({
    type: 'post',
    dataType: "json",
    url: "/tracker/",
    data: {
      'postType': 'goalTracker',
      'function': 'graph',
      'goalStartDate': goalStartDate,
      'goalEndDate': goalEndDate,
      'discordUserId': discordUserId,
      'currentUserId': currentUserId,
    },
    headers: { "X-CSRFToken": csrftoken },
  }).done(function(result) {
    // console.log(result);
    update_goal_chart(result, goalStartDate, goalEndDate);
  });
}

function get_dates_between(startDate, endDate) {
  const datesOutput = [];
  const currentDate = new Date(startDate);
  const currentEndDate = new Date(endDate);

  while (currentDate <= currentEndDate) {
    datesOutput.push(format_date_to_MMDDYYYY(new Date(currentDate)));
    currentDate.setDate(currentDate.getDate() + 1);
  }
  return datesOutput;
}

function remove_goal_chart_copies() {
  const container = document.getElementById("goalCharts");
  const copiedRows = container.querySelectorAll('.row:not(:first-child)');
  copiedRows.forEach(row => row.remove());
}

function update_goal_chart(result, startDate, endDate){
  let dateRange = get_dates_between(startDate, endDate);
  const container = document.getElementById("goalCharts");
  const rowTemplate = container.querySelector('.row');

  for (let i = 0; i < result.length; i++) {
    const newRow = rowTemplate.cloneNode(true);
    let pieChartId = 'chartPie' + String(i);
    let comboChartId = 'comboChart' + String(i);
    newRow.querySelector('#chartPie').id = pieChartId;
    newRow.querySelector('#comboChart').id = comboChartId;
    newRow.removeAttribute("style");
    container.appendChild(newRow);
    let data = result[i];
    // console.log(data)
    let combineData = data.goalRecords;
    let dateDict = {};
    let barData = [];
    let lineData = [];
    const goalEndDate = new Date(data.goalEndDate);
    const currentDate = new Date();
    const timeDifference = goalEndDate.getTime() - currentDate.getTime();
    const daysDifference = Math.round(timeDifference / (1000 * 60 * 60 * 24),0);
    let target = 0;
    // console.log(data.goalComplete)
    if (data.goalComplete != -1) {
      target = Math.max(Math.round((data.goalTarget-data.goalComplete)/daysDifference, 2), 0);    
    }
    // console.log(target)
    const reportName = "Study target for: " + data.goalTopic + ". From " + data.goalStartDate + " to " + data.goalEndDate;
    for (const item of combineData){
      let dateKey = format_date_to_MMDDYYYY(new Date(item.studyDate));
      if(!dateDict[dateKey]){
        dateDict[dateKey] = 0;
      }
      dateDict[dateKey] += item.studyTime;
    }
    // console.log(dateDict);
    for (let j=0; j<dateRange.length; j++){
      lineData.push(target);
      if (dateDict[dateRange[j]]){
        barData.push(dateDict[dateRange[j]]);
      }else{
        barData.push(0);
      }
    }
    // console.log(barData);
    // console.log(lineData);
    graph_goal_pie_chart(pieChartId, data);
    graph_goal_combine_chart(comboChartId, reportName, dateRange, barData, lineData);
  }
}

function graph_goal_pie_chart(chartId, ret) {
  let ctx = document.getElementById(chartId).getContext('2d');
  let existingChart = Chart.getChart(ctx);
  if (existingChart) {
    existingChart.destroy();
  }

  let goalComplete = 0;
  if ( ret['goalComplete'] != -1) {
    goalComplete = ret['goalComplete'];
  }
  let goalTarget = ret['goalTarget'];

  let goalPieChart = new Chart(ctx, {
    type: "pie",
    data: {
      labels: ['Completed', 'Remaining'],
      datasets: [{
        data: [goalComplete, Math.max(goalTarget - goalComplete, 0)],
        backgroundColor: dataPointColors,
        borderWidth: 2,
      }]
    },
    options: {
      tooltips: {
        enabled: false
      },
      plugins: {
        datalabels: {
          formatter: (value, ctx) => {
            const datapoints = ctx.chart.data.datasets[0].data
            const total = datapoints.reduce((total, datapoint) => total + datapoint, 0)
            const percentage = value / total * 100
            if (percentage == 0) {
              return;
            }
            return percentage.toFixed(2) + "%";
          },
          color: '#000000',
        }
      }
    },
    plugins: [ChartDataLabels],
    scales: {
      x: {
        display: false, // Hide x-axis label
      },
      y: {
        display: false,
      }
    }
  });
}

function graph_goal_combine_chart(chartId, reportName, labelData, barData, lineData){
  let ctx = document.getElementById(chartId).getContext('2d');
  let existingChart = Chart.getChart(ctx);
  if (existingChart) {
    existingChart.destroy();
  }

  // Create the combination chart
  let comboChart = new Chart(ctx, {
    type: "bar", // Set the initial type as "bar"
    data: {
      labels: labelData,
      datasets: [
        {
          type: "bar", // Type of dataset (bar)
          label: "Completed",
          backgroundColor: 'rgba(75, 192, 192, 0.5)',
          data: barData,
        },
        {
          type: "line", // Type of dataset (line)
          label: "Target",
          borderColor: "rgba(255, 99, 132, 1)",
          fill: false,
          data: lineData, // Line data
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
}