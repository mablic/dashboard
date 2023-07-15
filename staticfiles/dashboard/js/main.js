
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

function changeurl(url, title) {
  var new_url = '/' + url;
  window.history.pushState('data', title, new_url);
  
}

function isEmpty( el ){
  return !$.trim(el.html())
}