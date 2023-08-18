let goalTable;

function show_goal_modal() {
  reset_goal_modal();
  $('#goalModal').modal('show');
}

function get_start_date(){
  return $('#goalStartDate').val();
}

function get_end_date(){
  return $('#goalEndDate').val();
}

function get_topic() {
  return $('#goalTopic').val();
}

function get_target() {
  return $('#goalTarget').val();
}

function get_complete(){
  return $('#goalComplete').val();
}

$(document).ready(function() {
  (function() {
    let currentUserId = get_userId();
    let discordUserId = get_discord_userId();
    goalTable = $('#goalTable').DataTable({
      dom: '<"top"lfB>rt<"bottom"ip><"clear">',
      buttons: ['copy', 'excel', 'pdf'],
      ajax: {
        url: "/tracker/",
        dataSrc: "",
        data: {
          'viewType': "goalView",
          'discordUserId': discordUserId,
          'currentUserId': currentUserId,
        }
      },
      columns: [
        { data: 'goalStartDate' },
        { data: 'goalEndDate' },
        { data: 'goalTopic' },
        { data: 'goalTarget' },
        { data: 'goalComplete' }
      ],
      order: [[0, 'desc']]
    });
    $('#goalTable tbody').on('click', 'tr', function() {
      let data = goalTable.row(this).data();
    
      // Fill the modal with data from the clicked row
      let goalStartDate = $('#goalStartDate');
      let goalEndDate = $('#goalEndDate');
      let goalTopic = $('#goalTopic');
      let goalTarget = $('#goalTarget');
      let goalComplete = $('#goalComplete');
      goalStartDate.val(data.goalStartDate);
      goalStartDate.attr('goalOldValue', data.goalStartDate);
      goalEndDate.val(data.goalEndDate);
      goalEndDate.attr('goalOldValue', data.goalEndDate);
      goalTopic.val(data.goalTopic);
      goalTopic.attr('goalOldValue', data.goalTopic);
      goalTarget.val(data.goalTarget);
      goalTarget.attr('goalOldValue', data.goalTarget);
      goalComplete.val(data.goalComplete);
      goalComplete.attr('goalOldValue', data.goalComplete);
      $('#goalModal').modal('show');
    });
  })();
  $('#goalSideBar').on('hidden.bs.offcanvas', function () {
    console.log('Offcanvas closed');
    load_goal_chart();
  });
});

function reset_goal_modal(){
  $('#goalStartDate').val('');
  $('#goalEndDate').val('');
  $('#goalTopic').val('');
  $('#goalTarget').val('');
  $('#goalComplete').val('');
  $('#goalStartDate').attr('goalOldValue', '');
  $('#goalEndDate').attr('goalOldValue', '');
  $('#goalTopic').attr('goalOldValue', '');
  $('#goalTarget').attr('goalOldValue', '');
  $('#goalComplete').attr('goalOldValue', '');
  $('#goalModal').modal('hide');
}

function save_goal_change(event) {
  let form = document.getElementById('goalForm');
  if (!form.checkValidity()) {
    return;
  }
  submit_goal_to_views('add', event);
}

function delete_goal_change(event){
  let form = document.getElementById('goalForm');
  if (!form.checkValidity()) {
    return;
  }
  submit_goal_to_views('delete', event);
}

function submit_goal_to_views(action, event){
  let oldGoalStartDate = $('#goalStartDate').attr('goalOldValue');
  let oldGoalEndDate = $('#goalEndDate').attr('goalOldValue');
  let oldGoalTopic = $('#goalTopic').attr('goalOldValue');
  let oldGoalTarget = $('#goalTarget').attr('goalOldValue');
  let oldGoalComplete = $('#goalComplete').attr('goalOldValue');
  let goalStartDate = get_start_date();
  let goalEndDate = get_end_date();
  let goalTopic = get_topic();
  let goalTarget = get_target();
  let goalComplete = get_complete();
  let currentUserId = get_userId();
  let discordUserId = get_discord_userId();
  if (event) {
    event.preventDefault();
  }
  // event.preventDefault();
  // console.log(String(goalStartDate) + ',' + String(goalEndDate) + ',' + goalTopic + ',' + goalTarget + ',' + goalComplete);
  $.ajax({
    type: 'post',
    dataType: "json",
    url: "/tracker/",
    data: {
      'postType': 'goalTracker',
      'function': action,
      'oldGoalStartDate': oldGoalStartDate,
      'oldGoalEndDate': oldGoalEndDate,
      'oldGoalTopic': oldGoalTopic,
      'oldGoalTarget': oldGoalTarget,
      'oldGoalComplete': oldGoalComplete,      
      'goalStartDate': goalStartDate,
      'goalEndDate': goalEndDate,
      'goalTopic': goalTopic,
      'goalTarget': goalTarget,
      'goalComplete': goalComplete,
      'discordUserId': discordUserId,
      'currentUserId': currentUserId
    },
    headers: { "X-CSRFToken": csrftoken },
  }).done(function(result) {
    reset_goal_modal();
    var toastCard = $('#toastBody');
    toastCard.text(result['message']);
    $('.toast').toast('show');
    goalTable.ajax.reload();
    return;
  });
}