function formatTable() {
  var elements = $('[id=type_span_string]');
  document.getElementById("inputGroup1").style.display = "none";
  document.getElementById("inputGroup2").style.display = "none";
  document.getElementById("inputGroup3").style.display = "none";
  document.getElementById("inputGroup4").style.display = "none";
  for(var i = 0; i < elements.length; i++) {
    elements[i].className = "badge text-bg-secondary";
  }
  var elements = $('[id=type_span_hash-table]');
  for(var i = 0; i < elements.length; i++) {
    elements[i].className = "badge text-bg-success";
  }
  var elements = $('[id=type_span_dynamic-programming]');
  for(var i = 0; i < elements.length; i++) {
    elements[i].className = "badge text-bg-danger";
  }
  var elements = $('[id=type_span_math]');
  for(var i = 0; i < elements.length; i++) {
    elements[i].className = "badge text-bg-warning";
  }
  var elements = $('[id=type_span_sorting]');
  for(var i = 0; i < elements.length; i++) {
    elements[i].className = "badge text-bg-info";
  }
  var elements = $('[id=type_span_greedy]');
  for(var i = 0; i < elements.length; i++) {
    elements[i].className = "badge text-bg-light";
  }
  var elements = $('[id=type_span_database]');
  for(var i = 0; i < elements.length; i++) {
    elements[i].className = "badge text-bg-dark";
  }
  var elements = $('[id=type_span_Easy]');
  for(var i = 0; i < elements.length; i++) {
    elements[i].className = "badge text-bg-success";
  }
  var elements = $('[id=type_span_Medium]');
  for(var i = 0; i < elements.length; i++) {
    elements[i].className = "badge text-bg-warning";
  }
  var elements = $('[id=type_span_Hard]');
  for(var i = 0; i < elements.length; i++) {
    elements[i].className = "badge text-bg-danger";
  }
}

function viewLeetCode(ret) {

  var currentUser = $('#currentUser').text();
  var id = $(ret).attr('qn');
  var userId = $(ret).attr('currUser');
  var questionNo = $(ret).attr('questionno');
  var questionName = $(ret).attr('questionname');
  var dashboardHeader = $('#dashboardHeader');
  
  if (!currentUser){
    // console.log("NOT IN USER." + currentUser)
    var toastCard = $('#toastBody');
    toastCard.text("Please login");
    $('.toast').toast('show');
    $('#offcanvasRight').offcanvas('hide');

    return;
  }else{
    dashboardHeader.html('#' + String(questionNo) + ' - ' + 'Problem Dashboard <br /><br /><small>' + questionName + '</small>')
    $.ajax({
      type: 'post',
      headers: { "X-CSRFToken": csrftoken },
      data: {'postType': 'viewLeetCode', 'quesiontNo': String(id), 'userId': String(userId)},
    }).done(function(result) {
      // console.log(result)
      formatView(result)
    });
  }
}

function formatView(ret) {
  // console.log('Ret', ret)
  $('#insertGroup1').empty();
  $('#insertGroup2').empty();
  $('#insertGroup3').empty();
  $('#insertGroup4').empty();
  answerPost = ret['userAnswer'];
  currUser = ret['userId'];
  questionNo = ret['questionNo'];
  let curId = 0;
  for (var key in answerPost){
    for(let i = 0; i < answerPost[key].length; i++){
      var userId = answerPost[key][i][0];
      var userName = answerPost[key][i][1];
      var timeComplexity = answerPost[key][i][2];
      var spaceComplexity = answerPost[key][i][3];

      var nameGroup = $("#inputGroup" + String(key)).clone();
      nameGroup[0].id = "nameGroup" + String(curId);
      $("#insertGroup" + String(key)).append(nameGroup);
      nameGroup.find("span").html(userName);
      var selectFirst = nameGroup.find(".custom-select").first();
      var selectSecond = nameGroup.find(".custom-select").last();
      var submitButton = nameGroup.find(".btn-group").find('button');
      var okayButton = nameGroup.find(".btn-group").find('div a').first();
      var deleteButton = nameGroup.find(".btn-group").find('div a').last();
      okayButton.attr('questionno', String(questionNo));
      okayButton.attr('currId', String(curId));
      deleteButton.attr('questionno', String(questionNo));
      selectFirst.attr('id', 'select_' + String(curId) + '_1');
      selectSecond.attr('id', 'select_' + String(curId) + '_2');
      if (timeComplexity){
        selectFirst.val(String(timeComplexity)).change();
      }
      if (spaceComplexity){
        selectSecond.val(String(spaceComplexity)).change();
      }
      if (currUser != userId){
        selectFirst.attr('disabled', 'disabled');
        selectSecond.attr('disabled', 'disabled');
        submitButton.prop("disabled",true);
      }
      document.getElementById("nameGroup" + String(curId)).style.display = "";
      curId ++;
    }
  }
}

function submitDetails(ret) {
  var id = $(ret).attr('currId');
  var questionNo = $(ret).attr('questionno');
  var userId = $(ret).attr('userid');
  var ansId1 = $('#select_' + id + '_1')
  var ansId2 = $('#select_' + id + '_2')

  if (!isEmpty(ansId1)){
    var ansId1 = $('#select_' + id + '_1')[0].selectedIndex;
  }else{
    ansId1 = 0
  }
  if (!isEmpty(ansId2)){
    var ansId2 = $('#select_' + id + '_2')[0].selectedIndex;
  }else{
    ansId2 = 0
  }   
  $.ajax({
    type: 'post',
    headers: { "X-CSRFToken": csrftoken },
    data: {'postType': 'submitDetails', 'quesiontNo': String(questionNo), 
    'userId': String(userId), 'timeComplexity': String(ansId1), 'spaceComplexity': String(ansId2)},
  }).done(function(result) {
    formatView(result);
  });
}

function addUser(ret) {
  var questionNo = $(ret).attr('questionno');
  var userId = $(ret).attr('userid');
  var userName = $(ret).attr('userName');
  var ansType = $(ret).attr('ansType');
  var toastCard = $('#toastBody')
  var currentUser = $('#currentUser').text();

  if (!currentUser){
    // console.log("NOT IN USER." + currentUser)
    var toastCard = $('#toastBody');
    toastCard.text("Please login");
    $('.toast').toast('show');
    return;
  }else{
    $.ajax({
      type: 'post',
      headers: { "X-CSRFToken": csrftoken },
      data: {'postType': 'addUser', 'quesiontNo': String(questionNo), 
      'userId': String(userId), 'userName': String(userName), 'ansType': String(ansType)},
    }).done(function(result) {
      toastCard.text(result['response']);
      $('.toast').toast('show');
      var currentNode = $('#questionNoCount_' + questionNo);
      var newValue = parseInt(currentNode.text())+1;
      // console.log(newValue);
      currentNode[0].innerText = String(newValue);
    });
  }
}

function deleteDetails(ret) {
  var questionNo = $(ret).attr('questionno');
  var userId = $(ret).attr('userid');

  $.ajax({
    type: 'post',
    headers: { "X-CSRFToken": csrftoken },
    data: {'postType': 'delete', 'quesiontNo': String(questionNo), 
    'userId': String(userId)},
  }).done(function(result) {
    formatView(result);
    var currentNode = $('#questionNoCount_' + questionNo);
    var newValue = parseInt(currentNode.text())-1;
    // console.log(newValue);
    currentNode[0].innerText = String(newValue);
  });
}