(function(d, s, id) {
  var js, fjs = d.getElementsByTagName(s)[0];
  if (d.getElementById(id)) return;
  js = d.createElement(s); js.id = id;
  js.src = "//connect.facebook.net/en_US/sdk.js";
  fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));
var stfriend;
window.fbAsyncInit = function() {
  FB.init({
    appId      : '562604030601218',
    cookie     : true,  // enable cookies to allow the server to access the session
    xfbml      : true,  // parse social plugins on this page
    version    : 'v2.8' // use graph api version 2.8
  });
}

function statusChangeCallback(response){
  //all fields of callback of response: search "authResponse" in page goo.gl/OSl5EP
  console.log('statusChangeCallback');
  console.log(response);
  if (response.status === 'connected') {
    //login and authorized
    console.log('succeed!!!');
    user_id = response.authResponse['userID'];
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
  }, {scope: 'public_profile,email,user_friends,publish_actions'});
}

function inviteFriendToApp(){
  FB.ui({
    appid: 562604030601218,
    method: 'send',
    link: 'http://www.nctu.edu.tw'//<our_website's_url>
  });
}

function addFriendToActivity(){
  FB.api(
    "/me/friends",
    function (response) {
      if (response && !response.error) {
        //response has data, paging and summary fields
        //access them by . and [ ] like below
        for(var i=0;i<response.data.length;i++){
          console.log(response.data[i].name);
          console.log(response.data[i].id);
        }
      }else{
        console.log('Error in accessing friends list');
      }
    }
  );
}