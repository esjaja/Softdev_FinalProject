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
    if(window.location.pathname=="/activity"){
        $(document).trigger('loadList');
    }
}

$(document).bind('loadList',function(){
  friendsInApp($('#Add').attr('value'));
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

        FB.api(
          '/'+response.authResponse['userID'],
          'GET',
          {},
          function(res) {
              // Insert your code here
              var form = '';
              form += '<input type="hidden" name="token" value="'+response.authResponse['accessToken']+'">';
              form += '<input type="hidden" name="user_id" value="'+res.id+'">';
              form += '<input type="hidden" name="user_name" value="'+res.name+'">';
              $('<form action="/login" method="POST">'+form+'</form>').appendTo('body').submit();
          }
        );

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

function friendsInApp(token){
  //find all friend using our application and make the list of adding new members
  //'me/friends' or uid,{fields:'friends'}
  var membersInActivity = []; //push id
  $('#Member .menu .item').each(function(index, data){
    membersInActivity.push(data.id);
  });

  FB.api('me/friends',{ access_token: token},function (response) {

    if (response && !response.error) {
      //response has data, paging and summary fields
      //access them by . and [ ] like below
      for(var i=0;i<response.data.length;i++){
        //console.log(response.data[i].name);
        //console.log(response.data[i].id);
        if(membersInActivity.includes(response.data[i].id) == false)
          $('#addListMenu').append('<div id="'+response.data[i].id+'" class="item"><img class="ui avatar image" src="http://graph.facebook.com/'+response.data[i].id+'/picture?type=small">'+response.data[i].name+'</div>');
      }
    }else{
      console.log("error message: "+response.error.message);
    }
  });
}
function membersInActivity(token){
  //current uid
	var me = $('#Add').attr('name');
  //load members' names.
  $('#Member .menu .item').each(function(index, data){

    FB.api(data.id, { fields: 'name', access_token: token}, function (response) {

      if (response && !response.error) {
        var pre = data.innerHTML.split('>')[0];
        //if(data.id == me)
        	//data.innerHTML = pre + '>' + response.name;
       	//else
       		data.innerHTML = pre + '>' + response.name +'<i class="delete right red large link icon" onclick="removeMember(this)"></i>';
      }else{
        console.log("error message: "+response.error.message);
      }
    });
  });
}
