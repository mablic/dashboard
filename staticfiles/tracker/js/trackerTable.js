let GLOBAL_TABLE_VALUES = 'NA';
let table;

$(document).ready(function() {
  let currentUserId = get_userId();
  let discordUserId = get_discord_userId();
  table = $('#studyTable').DataTable({
    dom: '<"top"lfB>rt<"bottom"ip><"clear">',
    buttons: ['copy', 'excel', 'pdf'],
    ajax: {
      url: "/tracker/",
      dataSrc: "",
      data: {
        'viewType': "tableView",
        'discordUserId': discordUserId,
        'currentUserId': currentUserId,
      }
    },
    columns: [
      { data: 'studyDate' },
      { data: 'studyTopic' },
      { data: 'studyTime' }
    ],
    order: [[0, 'desc']]
  });
  // Handle click on a row to open the modal with row data
  $('#studyTable tbody').on('click', 'tr', function() {
    let data = table.row(this).data();
  
    // Fill the modal with data from the clicked row
    let studyDate = $('#inputStudyDate');
    let studyTopic = $('#inputStudyTopic');
    let studyTime = $('#inputStudyTime');
    studyDate.val(data.studyDate);
    studyDate.attr('oldValue', data.studyDate);
    studyTopic.val(data.studyTopic);
    studyTopic.attr('oldValue', data.studyTopic);
    studyTime.val(data.studyTime);
    studyTime.attr('oldValue', data.studyTime);
    GLOBAL_TABLE_VALUES = 'edit';
    $('#editModal').modal('show');
  });

  let inputStudyTime=$('#inputStudyTime');
  inputStudyTime.on('input', function() {
    let value = parseFloat($(this).val());
    // Check if the input is within the range
    if (isNaN(value) || value < 0 || value > 720) {
      $('#inputStudyTime').css('background-color', 'red');
    } else {
      $('#inputStudyTime').css('background-color', 'white');
    }
  });
});

function delete_tracker_record() {
  let oldStudyDate = $('#inputStudyDate').attr('oldValue');
  let oldStudyTopic = $('#inputStudyTopic').attr('oldValue');
  let oldStudyTime = $('#inputStudyTime').attr('oldValue');
  let currentUserId = get_userId();
  let discordUserId = get_discord_userId();

  $.ajax({
    type: 'post',
    dataType: "json",
    url: "/tracker/",
    data: {
      'postType': 'tableViewUpdate',
      'function': 'delete',
      'oldStudyDate': oldStudyDate,
      'oldStudyTopic': oldStudyTopic,
      'oldStudyTime': oldStudyTime,
      'discordUserId': discordUserId,
      'currentUserId': currentUserId,
    },
    headers: { "X-CSRFToken": csrftoken },
  }).done(function(result) {
    table.ajax.reload();
  });
  reset_modal();
}

function add_table_record() {
  GLOBAL_TABLE_VALUES = 'add';
  $('#editModal').modal('show');
}

function save_tracker_record() {
  // Get the modified data from the modal form
  let studyDate = $('#inputStudyDate').val();
  let studyTopic = $('#inputStudyTopic').val();
  let studyTime = $('#inputStudyTime').val();
  let oldStudyDate = $('#inputStudyDate').attr('oldValue');
  let oldStudyTopic = $('#inputStudyTopic').attr('oldValue');
  let oldStudyTime = $('#inputStudyTime').attr('oldValue');
  let currentUserId = get_userId();
  let discordUserId = get_discord_userId();

  let form = document.getElementById('editForm');
  if (!form.checkValidity()) {
    return;
  }

  $.ajax({
    type: 'post',
    dataType: "json",
    url: "/tracker/",
    data: {
      'postType': 'tableViewUpdate',
      'function': GLOBAL_TABLE_VALUES,
      'studyDate': studyDate,
      'studyTopic': studyTopic,
      'studyTime': studyTime,
      'oldStudyDate': oldStudyDate,
      'oldStudyTopic': oldStudyTopic,
      'oldStudyTime': oldStudyTime,
      'discordUserId': discordUserId,
      'currentUserId': currentUserId,
    },
    headers: { "X-CSRFToken": csrftoken },
  }).done(function() {
    table.ajax.reload();
  });
  reset_modal();
};

function reset_modal(){
  $('#inputStudyDate').val('');
  $('#inputStudyTopic').val('');
  $('#inputStudyTime').val('');
  $('#inputStudyDate').attr('oldValue', '');
  $('#inputStudyTopic').attr('oldValue', '');
  $('#inputStudyTime').attr('oldValue', '');
  $('#editModal').modal('hide');
}

document.getElementById('exportBtn').addEventListener('click', function() {
  let tableExport = document.getElementById('studyTable');
  TableToExcel.convert(tableExport, { filename: 'data.xlsx' }); // Perform the export
});
