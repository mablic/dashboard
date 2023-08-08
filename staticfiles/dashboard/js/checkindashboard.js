// Checkin functions

function viewCheckin(ret) {

  $('#newCheckIn').empty();
  var userDiscordId = $('#userDiscordId').text();
  var userId = $(ret).attr('currUser');
  var questionNo = $(ret).attr('questionno');
  var questionName = $(ret).attr('questionname');
  var checkInHeader = $('#checkInHeader');
  
  if (!userDiscordId){
    // console.log("NOT IN USER." + currentUser)
    var toastCard = $('#toastBody');
    toastCard.text("Please login");
    $('.toast').toast('show');
    $('#offcanvasRight').offcanvas('hide');
    return;
  }else{
    checkInHeader.html('#' + String(questionNo) + ' - ' + 'Problem CheckIn <br /><br /><small>' + questionName + '</small>')
    $.ajax({
      type: 'post',
      headers: { "X-CSRFToken": csrftoken },
      data: {'postType': 'viewCheckIn', 'quesiontNo': String(questionNo), 'userId': String(userId), 'userDiscordId': String(userDiscordId)},
    }).done(function(result) {
      var checkInButton = $('#checkInButton');
      checkInButton[0].setAttribute('questionNo',questionNo)
      // console.log("CheckIn Results:" + result['checkInTime'] + ";" + result['questionNo']);
      addToCheckInView(result);
    });
  }
}

function addToCheckInView(result){
  console.log(result)
  for (var ret in result['checkInTime']){
    console.log(result['checkInTime']);
    addCheckIn(result['checkInTime'][ret], result['questionNo'][ret]);
  }
}

function addCheckInCheck(ret) {

  var userDiscordId = $('#userDiscordId').text();
  var currentUser = $('#currentUser').text();
  var checkInTime = new Date().toISOString().slice(0, 10);
  var userId = $(ret).attr('currUser');
  var checkType = $(ret).attr('checkType');
  var questionNo = $(ret).attr('questionno');

  if (!currentUser){
    console.log("NOT IN USER." + currentUser)
    var toastCard = $('#toastBody');
    toastCard.text("Please login");
    $('.toast').toast('show');
    return;
  }

  if (!userDiscordId){
    // console.log("NOT IN USER." + currentUser)
    var toastCard = $('#toastBody');
    toastCard.text("Please connect your account with Discord from the Profile page");
    $('.toast').toast('show');
    return;
  }

  if (checkType == 'add'){
    $.ajax({
      type: 'post',
      headers: { "X-CSRFToken": csrftoken },
      data: {'postType': 'addCheckIn', 'quesiontNo': String(questionNo), 
      'userDiscordId': String(userDiscordId), 
      'checkInTime': String(checkInTime),
      'userId': String(userId)},
    }).done(function(result) {
      if(result['checkIn']){
        addCheckIn(checkInTime, questionNo);
      }else{
        var toastCard = $('#toastBody');
        toastCard.text("You have already checked for the day");
        $('.toast').toast('show');
      };
    });
  }else{   
    var currId = $(ret).attr('id').replace("checkInDelete","");
    console.log(currId);
    var currentTab = $('#checkIn'+currId);
    checkInTime = currentTab[0].querySelector('span').textContent;
    console.log('checkTime is:' + checkInTime);
    $.ajax({
      type: 'post',
      headers: { "X-CSRFToken": csrftoken },
      data: {'postType': 'removeCheckIn', 'quesiontNo': String(questionNo), 
      'userDiscordId': String(userDiscordId), 
      'checkInTime': String(checkInTime),
      'userId': String(userId)},
    }).done(function(result) {
      if(result['checkIn']){
        removeCheckIn(ret);
      }else{
        var toastCard = $('#toastBody');
        toastCard.text("Nothing to removed");
        $('.toast').toast('show');
      };
    });
  }
}

function addCheckIn(checkInTime, questionNo){

  var originalDiv = document.getElementById('checkIn0');
  var targetDiv = document.getElementById('newCheckIn');
  var clonedDiv = originalDiv.cloneNode(true);
  clonedDiv.getElementsByTagName('span')[0].innerHTML = checkInTime;
  clonedDiv.getElementsByTagName('button')[0].setAttribute('questionNo',String(questionNo))
  var lastBtm = 1;

  if (targetDiv.lastChild === null){
    clonedDiv.id = "checkIn1";
  }else{
    var lastId = parseInt(targetDiv.lastChild.id.substring(7, 100));
    lastBtm = lastId + 1;
    clonedDiv.id = "checkIn" + lastBtm.toString();
  }
  clonedDiv.style.display='flex';
  targetDiv.appendChild(clonedDiv);
  targetDiv.lastElementChild.getElementsByTagName('button')[0].id = "checkInDelete" + lastBtm.toString();
}

function removeCheckIn(ret){
  // console.log(ret.id);
  var lastId = parseInt(ret.id.substring(13, 100));
  // console.log(lastId);
  var removeNode = document.getElementById('checkIn' + lastId.toString());
  removeNode.remove();
}