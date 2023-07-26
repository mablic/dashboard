var GLOBAL_TABLE_VALUES = 'NA';

$(document).ready(function() {
  var currentUserId = getUserId();
  var discordUserId = getDiscordUserId();
  var table = $('#studyTable').DataTable({
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
    ]
  });

  // Handle click on a row to open the modal with row data
  $('#studyTable tbody').on('click', 'tr', function() {
    var data = table.row(this).data();

    // Fill the modal with data from the clicked row
    var studyDate = $('#inputStudyDate');
    var studyTopic = $('#inputStudyTopic');
    var studyTime = $('#inputStudyTime');
    studyDate.val(data.studyDate);
    studyDate.attr('oldValue', data.studyDate);
    studyTopic.val(data.studyTopic);
    studyTopic.attr('oldValue', data.studyTopic);
    studyTime.val(data.studyTime);
    studyTime.attr('oldValue', data.studyTime);
    GLOBAL_TABLE_VALUES = 'edit';
    $('#editModal').modal('show');
  });

  $('#saveChangesBtn').on('click', function() {
    // Get the modified data from the modal form
    var studyDate = $('#inputStudyDate').val();
    var studyTopic = $('#inputStudyTopic').val();
    var studyTime = $('#inputStudyTime').val();
    var oldStudyDate = $('#inputStudyDate').attr('oldValue');
    var oldStudyTopic = $('#inputStudyTopic').attr('oldValue');
    var oldStudyTime = $('#inputStudyTime').attr('oldValue');
    var currentUserId = getUserId();
    var discordUserId = getDiscordUserId();
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
    }).done(function(result) {
        table.ajax.reload(null, false);
    });
    resetModal();
  });

  $('#addRecordBtn').on('click', function() {
    GLOBAL_TABLE_VALUES = 'add';
    $('#editModal').modal('show');
  })

  $('#deleteBtn').on('click', function() {
    var oldStudyDate = $('#inputStudyDate').attr('oldValue');
    var oldStudyTopic = $('#inputStudyTopic').attr('oldValue');
    var oldStudyTime = $('#inputStudyTime').attr('oldValue');

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
        table.ajax.reload(null, false);
    });
    // Hide the modal after updating the data
    resetModal();
  })
  var inputStudyTime=$('#inputStudyTime');
  inputStudyTime.on('input', function() {
    var value = parseFloat($(this).val());
    // Check if the input is within the range
    if (isNaN(value) || value < 0 || value > 720) {
        $('#inputStudyTime').css('background-color', 'red');
    } else {
        $('#inputStudyTime').css('background-color', 'white');
    }
  });
});

function resetModal(){
  $('#inputStudyDate').val('');
  $('#inputStudyTopic').val('');
  $('#inputStudyTime').val('');
  $('#inputStudyDate').attr('oldValue', '');
  $('#inputStudyTopic').attr('oldValue', '');
  $('#inputStudyTime').attr('oldValue', '');
  $('#editModal').modal('hide');
}

document.getElementById('exportBtn').addEventListener('click', function() {
  var table = document.getElementById('studyTable');
  TableToExcel.convert(table, { filename: 'data.xlsx' }); // Perform the export
});

