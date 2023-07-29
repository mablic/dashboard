
let GLOBAL_FILTER_LIST = {
  userFilter: "all_user_filter",
  difficult: [],
  question: "",
  text: "",
  startDate: "",
  endDate: "",
  currentView: "standardView",
  currentTable: "#standardViewBody"
};

function getStartDate(){
  var startDate = GLOBAL_FILTER_LIST.startDate;
  return (startDate === undefined || startDate === '') ? "01/01/2020": startDate;
}

function getEndDate(){
  var endDate = GLOBAL_FILTER_LIST.endDate;
  return (endDate === undefined || endDate === '') ? "12/31/2099": endDate;
}

function getUserFilter(){
  var userFilter = GLOBAL_FILTER_LIST.userFilter;
  return (userFilter === undefined || userFilter === '') ? "all_user_filter": userFilter;
}

function getDifficultFilter(){
  var difficultFilter = GLOBAL_FILTER_LIST['difficult'].join(";");
  return (difficultFilter === undefined || difficultFilter === '') ? "All": difficultFilter;
}

function getQuestionFilter(){
  var questionFilter = GLOBAL_FILTER_LIST['question'];
  return (questionFilter === undefined || questionFilter === '') ? "All": questionFilter;
}

function getTextFilter(){
  return (GLOBAL_FILTER_LIST['textFilter'] === undefined) ? "": GLOBAL_FILTER_LIST['textFilter'];
}

function getUserDiscordId(){
  var userDiscordId = $("#userDiscordId").text();
  if(GLOBAL_FILTER_LIST.currentView != 'standardView'){
    return (userDiscordId === undefined) ? "": userDiscordId;
  }
  return "";
}

function getCurrentView(){
  if(GLOBAL_FILTER_LIST['currentView'] === undefined){
    GLOBAL_FILTER_LIST['currentView'] = "standardView";
  }
  if(GLOBAL_FILTER_LIST['currentView'] === "checkInView"){
    GLOBAL_FILTER_LIST['currentTable'] = "#checkInViewBody";
  }else{
    GLOBAL_FILTER_LIST['currentTable'] = "#standardViewBody";
  }
}

function disableAllButtons(){
  $('#filterContainer button').prop('disabled', true);
  $('#filterContainer input').prop('disabled', true);
}

function enableAllButtons(){
  $('#filterContainer button').prop('disabled', false);
  $('#filterContainer input').prop('disabled', false);
}

function resetAllFilter(){
  var allFilter = $('li.list-group-item');
  var allQuestionsFilter = $('#difficultListGroup');
  for (i=0; i<allFilter.length; i++){
    allFilter[i].childNodes[1].checked = false;
  }
  for (i=0; i<allQuestionsFilter.length; i++){
    allQuestionsFilter[i].childNodes[1].childNodes[1].childNodes[1].checked=false;
  }
  GLOBAL_FILTER_LIST.difficult = [];
  GLOBAL_FILTER_LIST.question = "";
  GLOBAL_FILTER_LIST.text = "";
  // GLOBAL_FILTER_LIST.currentView = "standardView";
  getCurrentView();

  $("#startDatePicker")[0].value = "";
  $("#endDatePicker")[0].value = "";
  $('#textFilter').val("");
}

$(document).ready(function() {
  // Initialize datepicker for startDatePicker
  $("#startDatePicker").datepicker({
    changeMonth: true,
    changeYear: true,
    onSelect: function() {
      pickStartDateFunction();
    }
  });

  // Initialize datepicker for endDatePicker
  $("#endDatePicker").datepicker({
    changeMonth: true,
    changeYear: true,
    onSelect: function() {
      pickEndDateFunction();
    }
  });

  document.getElementById('exportToExcel').addEventListener('click', function() {
    // var table = document.getElementById('standardViewTable');
    // console.log(GLOBAL_FILTER_LIST['currentTable'].slice(1,100));
    var table = document.getElementById(GLOBAL_FILTER_LIST['currentTable'].slice(1,100));
     // Replace 'tableId' with the ID of your table element
    TableToExcel.convert(table, { filename: 'data.xlsx' }); // Perform the export
  });

  $(document).on('click', '#paginationSection a', function(event) {
    event.preventDefault();
    var url = window.location.href;
  
    // Create an empty object for the parameters
    var params = {};
    // Add the parameters to the object
    params['difficult'] = getDifficultFilter();
    params['question'] = getQuestionFilter();
    params['userName'] = getUserFilter();
    params['textFilter'] = getTextFilter();
    params['startDate'] = getStartDate();
    params['endDate'] = getEndDate();
    params['userDiscordId'] = getUserDiscordId();
  
    var querystring = new URLSearchParams(params).toString();
    // console.log("The query string is: " + querystring);
    // Modify the URL variable to include the query string
    url = url.split('?')[0] + '?' + querystring;
    var page = $(this).data('page');
  
    if (page) {
      // Append the page parameter to the URL
      url += '&page=' + page;
      // console.log("The final URL is: " + url);
  
      $.get(url, function(data) {
        // console.log("URL IS: " + url);
        var paginationHtml = $(data).find('#paginationSection').html();
        $('#paginationSection').html(paginationHtml);
        $('#standardViewBody').html($(data).find('#standardViewBody').html());
        formatTable();
      });
    }
  });  
});

// date picker
function pickStartDateFunction() {
  $( "#startDatePicker" ).datepicker({
    changeMonth: true,
    changeYear: true
  });
  GLOBAL_FILTER_LIST['startDate'] = $("#startDatePicker")[0].value;
};

function pickEndDateFunction() {
  var startDate = $("#startDatePicker").val();
  var endDate = $("#endDatePicker").val();

  if(startDate == ""){
    startDate = "01/01/2020";
  }
  GLOBAL_FILTER_LIST['startDate'] = startDate;
  GLOBAL_FILTER_LIST['endDate'] = endDate;

  var difficultFilter = getDifficultFilter();
  var userFilter = getUserFilter();
  var questionFilter = getQuestionFilter();
  var textFilter = getTextFilter();
  var userDiscordId = getUserDiscordId();
  getCurrentView();
  formatFilterView(questionFilter, difficultFilter, userFilter, 
    textFilter, startDate, endDate, GLOBAL_FILTER_LIST.currentView, GLOBAL_FILTER_LIST.currentTable, userDiscordId); 
};

function filterByUser(ret){
  var userName = $(ret).attr('value');
  var urlValue = $(ret).attr('urlValue');
  resetAllFilter();
  GLOBAL_FILTER_LIST.userFilter = userName;
  var startDate = getStartDate();
  var endDate = getEndDate();
  var userDiscordId = "";
  if (GLOBAL_FILTER_LIST.currentView != "standardView"){
    userDiscordId = $("#userDiscordId").text();
  }
  getCurrentView();
  $.ajax({
    type: 'GET',
    dataType: "html",
    url: urlValue,
    data: {'userName': userName, 'userFilter': true, 'currentView': 
    GLOBAL_FILTER_LIST.currentView, 'startDate': startDate, 'endDate': endDate, 'userDiscordId': userDiscordId},
    headers: { "X-CSRFToken": csrftoken },
  }).done(function(data) {
    $(GLOBAL_FILTER_LIST.currentTable).html($(GLOBAL_FILTER_LIST.currentTable,data).html());
    $("#paginationSection").html($('#paginationSection',data).html());
    formatTable();
    window.history.pushState(null, null, urlValue);
  }).fail(function(xhr, status, error)  {
    console.log(JSON.parse(xhr.responseText));
  });  
}

function addDifficultFilter(ret){
  // set the difficult filter
  var difficultFilterValue = $(ret).attr('value');
  var difficultFilter = "";
  var difficultAllFilter = $('li.list-group-item');
  if (difficultFilterValue == 'All'){
    GLOBAL_FILTER_LIST['difficult'] = ["All"]
    for (i=1; i<difficultAllFilter.length; i++){
      difficultAllFilter[i].childNodes[1].checked = false;
    }
  } else {
    if (GLOBAL_FILTER_LIST['difficult'].includes(difficultFilterValue)){
        var index = GLOBAL_FILTER_LIST['difficult'].indexOf(difficultFilterValue);
        GLOBAL_FILTER_LIST['difficult'].splice(index, 1);
    }else{
        GLOBAL_FILTER_LIST['difficult'].push(difficultFilterValue);
    }
    difficultAllFilter[0].childNodes[1].checked = false;
  }
  var difficultFilter = GLOBAL_FILTER_LIST['difficult'].join(";");

  // set the other filters
  var questionFilter = getQuestionFilter();
  var textFilter = getTextFilter();
  var userFilter = getUserFilter();
  var startDate = getStartDate();
  var endDate = getEndDate();
  var userDiscordId = getUserDiscordId();
  getCurrentView();

  formatFilterView(questionFilter, difficultFilter, userFilter, textFilter, 
    startDate, endDate, GLOBAL_FILTER_LIST.currentView, GLOBAL_FILTER_LIST.currentTable, userDiscordId); 
}

function addQuestionFilter(ret){
  // set the question filter
  var questionFilter = $(ret).attr('value');
  GLOBAL_FILTER_LIST['question'] = questionFilter;

  // $('#questionFilter').val(questionFilter);
  // set the other filter
  var difficultFilter = getDifficultFilter();
  var userFilter = getUserFilter();
  var textFilter = getTextFilter();
  var startDate = getStartDate();
  var endDate = getEndDate();
  var userDiscordId = getUserDiscordId();
  getCurrentView();

  formatFilterView(questionFilter, difficultFilter, userFilter, textFilter, 
    startDate, endDate, GLOBAL_FILTER_LIST.currentView, GLOBAL_FILTER_LIST.currentTable,
    userDiscordId); 
}

function addNumberFilter(){
  resetAllFilter();
  setTimeout(function() {
  }, 3000);
  var numberFilter = document.getElementById("numberFilter").value;
  if (numberFilter == ''){
    numberFilter = '0';
  }
  var difficultFilter = getDifficultFilter();
  var userFilter = getUserFilter();
  var questionFilter = getQuestionFilter();
  var startDate = getStartDate();
  var endDate = getEndDate();
  var textFilter = getTextFilter();
  var userDiscordId = getUserDiscordId();
  getCurrentView();

  formatFilterView(questionFilter, difficultFilter, userFilter, 
    textFilter, startDate, endDate, GLOBAL_FILTER_LIST.currentView, GLOBAL_FILTER_LIST.currentTable, userDiscordId, numberFilter); 
};

function addTextFilter(){
  setTimeout(function() {
  }, 3000);
  var textFilter = document.getElementById("textFilter").value;
  GLOBAL_FILTER_LIST['textFilter'] = textFilter;

  // set the other filter
  var difficultFilter = getDifficultFilter();
  var userFilter = getUserFilter();
  var questionFilter = getQuestionFilter();
  var startDate = getStartDate();
  var endDate = getEndDate();
  var userDiscordId = getUserDiscordId();

  getCurrentView();
  // console.log("In the text filter:" + textFilter + ". DifficultFilter:"+difficultFilter +". userFilter:" + userFilter);
  formatFilterView(questionFilter, difficultFilter, userFilter, textFilter, 
    startDate, endDate, GLOBAL_FILTER_LIST.currentView, GLOBAL_FILTER_LIST.currentTable, userDiscordId); 
}

function toggleChildRowsVisibility(rowNumber) {
  var childRows = document.querySelectorAll('#childRows' + rowNumber);
  for (var i = 0; i < childRows.length; i++) {
    if (childRows[i].style.display === "none") {
      childRows[i].style.display = "table-row";
    } else {
      childRows[i].style.display = "none";
    }
  }
}

function formatStandardView(ret) {
  resetAllFilter();
  enableAllButtons();
  var userName = getUserFilter();
  var urlValue = $(ret).attr('urlValue');
  var currentUser = $('#currentUser').text();
  GLOBAL_FILTER_LIST.currentView = "standardView";

  if (!currentUser){
    var toastCard = $('#toastBody');
    toastCard.text("Please login");
    $('.toast').toast('show');
    return;
  }

  var difficultFilter = getDifficultFilter();
  var userFilter = getUserFilter();
  var questionFilter = getQuestionFilter();
  var startDate = getStartDate();
  var endDate = getEndDate();
  var textFilter = getTextFilter();
  getCurrentView();

  formatFilterView(questionFilter, difficultFilter, userFilter, 
    textFilter, startDate, endDate, GLOBAL_FILTER_LIST.currentView, GLOBAL_FILTER_LIST.currentTable, ''); 
}

function formatCheckInView(ret) {
  resetAllFilter();
  enableAllButtons();
  var userName = getUserFilter();
  var urlValue = $(ret).attr('urlValue');
  // console.log("IN THE FORMAT VIEW!")
  var currentUser = $('#currentUser').text();
  GLOBAL_FILTER_LIST.currentView = "checkInView";

  if (!currentUser){
    // console.log("NOT IN USER." + currentUser)
    var toastCard = $('#toastBody');
    toastCard.text("Please login");
    $('.toast').toast('show');
    return;
  }

  var difficultFilter = getDifficultFilter();
  var userFilter = getUserFilter();
  var questionFilter = getQuestionFilter();
  var startDate = getStartDate();
  var endDate = getEndDate();
  var textFilter = getTextFilter();
  var userDiscordId = getUserDiscordId();
  getCurrentView();

  // console.log("In the text filter:" + textFilter + ". DifficultFilter:"+difficultFilter +". userFilter:" 
  //   + userFilter + ". StartDate is:" + startDate + ". EndDate is:" + endDate 
  //   + ". QuestionFilter is:" + questionFilter);
  formatFilterView(questionFilter, difficultFilter, userFilter, 
    textFilter, startDate, endDate, GLOBAL_FILTER_LIST.currentView, GLOBAL_FILTER_LIST.currentTable, userDiscordId); 
}

function formatFilterView(questionFilter, difficultFilter, 
  userFilter, textFilter, startDate, endDate, currentView, currentTable, userDiscordId, numberFilter=0) {

  $.ajax({
    type: 'GET',
    dataType: "html",
    url: "/dashboard/",
    data: {'question': questionFilter, 'difficult': difficultFilter, 
    'userName': userFilter, 'textFilter': textFilter, 
    'startDate': startDate, 'endDate': endDate,
    'userDiscordId': userDiscordId,
    'currentView': currentView,
    'numberFilter': numberFilter,
  },
    headers: { "X-CSRFToken": csrftoken },
  }).done(function(data) {
    $(currentTable).html($(currentTable,data).html());
    $("#paginationSection").html($('#paginationSection',data).html());
    formatTable();
  }).fail(function(xhr, status, error)  {
    console.log(JSON.parse(xhr.responseText));
    return;
  });
}
