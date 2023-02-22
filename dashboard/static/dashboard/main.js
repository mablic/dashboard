let GLOBAL_FILTER_LIST = {
    difficult: [],
    question: ""
};

var csrftoken = getCookie('csrftoken');
let userFilter = "all_user_filter";

var csrf_token = $('input[name="csrfmiddlewaretoken"]').val();

$.ajax({
    url: '/',
    type: 'POST',
    data: {
        // your data here
        csrfmiddlewaretoken: csrf_token
    },
    success: function(response) {
        // handle success
    },
    error: function(xhr, status, error) {
        // handle error
    }
});

function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

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
    }else{
        // console.log("IN ELSE");
        dashboardHeader.html('#' + String(questionNo) + ' - ' + 'Problem Dashboard <br /><br /><small>' + questionName + '</small>')
        // console.log("UserId: "+ userId);
        // console.log("questionNo: "+ questionNo);
        // console.log("questionname: "+ questionName);
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
    }else{
        $.ajax({
            type: 'post',
            headers: { "X-CSRFToken": csrftoken },
            data: {'postType': 'addUser', 'quesiontNo': String(questionNo), 
            'userId': String(userId), 'userName': String(userName), 'ansType': String(ansType)},
        }).done(function(result) {
            toastCard.text(result['response']);
            $('.toast').toast('show');
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
    });
}

function filterByUser(ret){
    var userName = $(ret).attr('value');
    var urlValue = $(ret).attr('urlValue');
    var allFilter = $('li.list-group-item');
    var allQuestionsFilter = $('#difficultListGroup');
    for (i=0; i<allFilter.length; i++){
        allFilter[i].childNodes[1].checked = false;
    }
    for (i=0; i<allQuestionsFilter.length; i++){
        allQuestionsFilter[i].childNodes[1].childNodes[1].childNodes[1].checked=false;
    }
    // console.log("In the user File function: URL:" + urlValue)
    userFilter = userName;
    $('#userFilter').val(userFilter);
    GLOBAL_FILTER_LIST.difficult = [];
    GLOBAL_FILTER_LIST.question = "";
    $.ajax({
        type: 'GET',
        dataType: "html",
        url: urlValue,
        data: {'userName': userFilter, 'userFilter': true},
        headers: { "X-CSRFToken": csrftoken },
    }).done(function(data) {
        // console.log('success!');
        $("#dashboardBody").html($('#dashboardBody',data).html());
        $("#paginationSection").html($('#paginationSection',data).html());
        // changeurl(urlValue, '');
        // window.location.replace(urlValue);
        formatTable();
        // console.log("URL result: " + urlValue + '?userName=' + userFilter)
        window.history.pushState(null, null, urlValue);
    }).fail(function(xhr, status, error)  {
        console.log(JSON.parse(xhr.responseText));
    });  
}

function addTypeFilter(ret){
    var filterValue = $(ret).attr('value');
    var dataValue = "";
    var allFilter = $('li.list-group-item');
    if (filterValue == 'All'){
        GLOBAL_FILTER_LIST['difficult'] = ["All"]
        for (i=1; i<allFilter.length; i++){
            allFilter[i].childNodes[1].checked = false;
        }
    } else {
        if (GLOBAL_FILTER_LIST['difficult'].includes(filterValue)){
            var index = GLOBAL_FILTER_LIST['difficult'].indexOf(filterValue);
            GLOBAL_FILTER_LIST['difficult'].splice(index, 1);
        }else{
            GLOBAL_FILTER_LIST['difficult'].push(filterValue);
        }
        allFilter[0].childNodes[1].checked = false;
    }
    var dataValue = GLOBAL_FILTER_LIST['difficult'].join(";");
    $('#difficultyFilter').val(dataValue);
    var questionFilter = $('#questionFilter').val();
    if (questionFilter == ""){
        questionFilter = "All";
    }
    $.ajax({
        type: 'GET',
        dataType: "html",
        url: "/dashboard/",
        data: {'difficult': dataValue, 'question': questionFilter, 'userName': userFilter},
        headers: { "X-CSRFToken": csrftoken },
    }).done(function(data) {
        $("#dashboardBody").html($('#dashboardBody',data).html());
        $("#paginationSection").html($('#paginationSection',data).html());
        formatTable();
    }).fail(function(xhr, status, error)  {
        console.log(JSON.parse(xhr.responseText));
    }); 
}

function addQuestionFilter(ret){
    var filterValue = $(ret).attr('value');
    GLOBAL_FILTER_LIST['question'] = filterValue;
    $('#questionFilter').val(filterValue);
    var difficultFilter = $('#difficultyFilter').val();
    if (difficultFilter == ""){
        difficultFilter = "All"
    }
    // console.log("Question Filter is:" + filterValue  + " in difficult:" + difficultFilter);
    $.ajax({
        type: 'GET',
        dataType: "html",
        url: "/dashboard/",
        // dataType: "json",
        data: {'question': filterValue, 'difficult': difficultFilter, 'userName': userFilter},
        headers: { "X-CSRFToken": csrftoken },
    }).done(function(data) {
        $("#dashboardBody").html($('#dashboardBody',data).html());
        $("#paginationSection").html($('#paginationSection',data).html());
        formatTable();
    }).fail(function(xhr, status, error)  {
        console.log(JSON.parse(xhr.responseText));
    }); 
}

$(document).on('click', '#paginationSection a', function(event) {
    event.preventDefault();
    var url = window.location.href;
    var params = new URLSearchParams();
    if($('#difficultyFilter').val()!=''){
        params.append('difficult', $('#difficultyFilter').val());
    }
    if($('#questionFilter').val()!=''){
        params.append('question', $('#questionFilter').val());
    }
    if($('#userFilter').val()!=''){
        params.append('userName', $('#userFilter').val());
    }

    var querystring = params.toString();
    // then modify the url variable to include the query string
    url = url.split('?')[0] + '?' + querystring;
    var page = $(this).data('page');
    // console.log("current url in the js is:" + url); 
    if (page) {
        var querystring = url.split('?')[1];
        var data = {
            // 'page': page
        };
        if (querystring) {
            url = url.split('?')[0] + '?page=' + page + '&' + querystring;
            // console.log("url is:" + url);
            var filterParams = new URLSearchParams(querystring);
            filterParams.forEach(function(value, key) {
                data[key] = value;
            });
        } else {
            url = url.split('?')[0] + '?page=' + page;
            var filterParams = new URLSearchParams(querystring);
        }
        $.get(url, data, function(data) {
            var paginationHtml = $(data).find('#paginationSection').html();
            $('#paginationSection').html(paginationHtml);
            $('#dashboardBody').html($(data).find('#dashboardBody').html());
            formatTable();
        });
    }
});

function changeurl(url, title) {
    var new_url = '/' + url;
    window.history.pushState('data', title, new_url);
    
}

function isEmpty( el ){
    return !$.trim(el.html())
}