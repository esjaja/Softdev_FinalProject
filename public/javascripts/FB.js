(function(d, s, id) {
    var js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) return;
    js = d.createElement(s); js.id = id;
    js.src = "//connect.facebook.net/en_US/sdk.js";
    fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));

window.fbAsyncInit = function() {
    FB.init({
        appId: '562604030601218', //1762557207338774
        cookie: true,    // enable cookies to allow the server to access the session
        xfbml: true,    // parse social plugins on this page
        status: true,   //check login status
        version: 'v2.8' // use graph api version 2.8
    });
    if(window.location.pathname=="/"){
        FB.getLoginStatus(function(response) {
            statusChangeCallback(response);
        });
    }
    if(window.location.pathname=="/activity"){
        $(document).trigger('loadList');
    }
}

$(document).bind('loadList',function(){

  membersInActivity($('#Add').attr('value'));
});

function statusChangeCallback(response){
	//all fields of callback of response: search "authResponse" in page goo.gl/OSl5EP
    console.log('statusChangeCallback');
    console.log(response);
    if (response.status === 'connected') {
        //login and authorized
        console.log('succeed!!!');
        //window.location.replace('/login?token='+response['authResponse']['accessToken']+"&id="+response['authResponse']['userID']);

        var form = '';
        form += '<input type="hidden" name="token" value="'+response.authResponse['accessToken']+'">';
        form += '<input type="hidden" name="user_id" value="'+response.authResponse['userID']+'">';
        $('<form action="/login" method="POST">'+form+'</form>').appendTo('body').submit();

    } else if (response.status === 'not_authorized') {
        //login facebook but not authorize
        console.log('please authorize the app to use the service.');
    } else {
        //have not login to facebook yet
        console.log('login first');
    }
}

//call this fundtion when clicking button
function checkLoginState(){
	FB.login(function(response) {
        statusChangeCallback(response);
    }, {scope: 'public_profile,email,user_friends'});
}

function inviteFriendToApp(){
  FB.ui({
    appid: 562604030601218,
    method: 'send',
    link: 'http://www.nctu.edu.tw'//<our_website's_url>
  });
}

function membersInActivity(token){
  //load members' names.
  $('#Member .menu .item').each(function(index, data){

    FB.api(data.id, { fielss: 'name', access_token: token}, function (response) {

      if (response && !response.error) {
        var pre = data.innerHTML.split('>')[0];
        data.innerHTML = pre + '>' + response.name;
      }else{
        console.log("error message: "+response.error.message);
      }
    });
  });
}