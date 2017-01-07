//var activity = JSON.parse(activities);

var months = ["JANUARY","FEBUARY","MARCH","APRIL","MAY","JUNE","JULY","AUGUST","SEPTEMBER","OCTOBER","NOVEMBER","DECEMBER"];
var date = new Date();
var votedateList = [];
var editdateList = [];
var pre_votedateList = [];
var pre_editdateList = [];
$(document).ready(function(){

	init();

	// change calendar month
	$('.monthButton').click(function(){
		if(this.id == 'right')date.setMonth(date.getMonth()+1);
		else if(this.id == 'left')date.setMonth(date.getMonth()-1);
		calendarDate(date);
	})
	// change calendar month by mouse scroll
	$('#calendar').on('mousewheel',function(){
		console.log(event.deltaY);
		if(event.deltaY>0)date.setMonth(date.getMonth()+1);
		else date.setMonth(date.getMonth()-1);
		calendarDate(date);
	})

	// search and display
	$('#activityList input').on('input',function(){
		var act = searchActivity($(this).val());
		//showActivity(act);
	});

	$('.item').click(function(){
		console.log(this);
	})

});

function init(){
	calendarDate(date);
}


function calendarDate(date){
	$('#mon').text(months[date.getMonth()]);
	$('#year').text(date.getFullYear());
		var days = $('#day li');
		var firstDay = new Date(date.getFullYear(),date.getMonth());
		var lastDate = new Date(date.getFullYear(),date.getMonth()+1,0);
		var preMonlastDate = new Date(date.getFullYear(),date.getMonth(),0);
		firstDay = firstDay.getDay();
		lastDate = lastDate.getDate();
		preMonlastDate = preMonlastDate.getDate();
		// preMonDisplay
		for(var i=0 ; i < firstDay ; i++){
			$(days[i]).text(preMonlastDate - firstDay + i +1);
			$(days[i]).addClass('disabledDays');
		}
		// thisMon
		for(var i=1 ; i <= lastDate ; i++){
			$(days[firstDay + i-1]).text(i);
			$(days[firstDay + i-1]).removeClass('disabledDays');
		}
		// nextMon
		for(var i=firstDay+lastDate; i<= days.length ; i++){
			$(days[i]).text(i - (firstDay+lastDate) +1);
			$(days[i]).addClass('disabledDays');
		}

		//get activities in the month
		$.ajax({
			url: "get_activities_month",
			data: {
				month: date.getMonth()
			},
			type: "POST",
			dataType: "json",
			success: function(data, textStatus, jqXHR) {
				// to be filled in what to do -----------------------
				console.log("get month success!");
				console.log(data);
			},
			error: function() {
				console.log("get month failed! QQ");
			}
		});
}


function showActivity(activity){
	$(".ui.link.items").text("");
	$.each(activity,activityAdd);
}

function activityAdd(){
		//console.log(this.name+" "+this.date );
		var item = '<div class="item">\
                <div class="content">\
                    <div class="header">'+this.name+'</div>\
                    <div class="content">\
                        <span>'+this.description+'</span>\
                    </div>\
                    <div class="extra">\
                    <div class="ui right floated">\
                        '+this.date+'</div>\
                    </div>\
                </div>\
            </div> <div class="ui divider"></div>';
		$(".ui.link.items").append(item);
}

function searchActivity(val){
	var regExp = new RegExp(val,'gi');
	console.log("search regExp:" + regExp);
	$('#activities > .item').each((index, element) => {
		let string = $(element).text();
		console.log(string);
		if(string.match(regExp)!==null) {
			$(element).css('display', 'block');
			// display a line between activities
			$(element).next().css('display','block');
		}
		else {console.log("noo"); $(element).css('display', 'none');
		$(element).next().css('display','none');}
	});
	return;
}

/*music player*/
//https://www.webcodegeeks.com/html5/html5-audio-player-example/
function showMusicPlayer(files, PlayerList, TitleList){
    //console.log(PlayerList);
    //console.log(TitleList);
    document.getElementById('MusicList').innerHTML =
    '<div id="playlist" style="text-align:center;">'+
        '<p id="music_title"></p>'+
        '<audio controls autoplay></audio>'+
        '<button id="back" class="ui green button" style="width:25px;height:35px;font-size:20px;" >'+
            '<i class="backward icon"></i>'+
        '</button>'+
        '<button id="next" class="ui green button" style="width:25px;height:35px;font-size:20px;" >'+
            '<i class="forward icon"></i>'+
        '</button>'+
    '</div>';
    var current = 0;
    var playlistPlayer = document.querySelector("#playlist audio");
    document.getElementById('music_title').innerHTML = "<strong>"+TitleList[current]+"</strong>";
    function next() {
        // Check for last media in the playlist
       if (current === files.length - 1) {
            current = 0;
        } else {
            current++;
        }
        // Change the audio element source
        playlistPlayer.src = PlayerList[current];
        document.getElementById('music_title').innerHTML = "<strong>"+TitleList[current]+"</strong>";
    }
    function PressNext() {
        // Check for last media in the playlist
       if (current === files.length - 1) {
            current = 0;
        } else {
            current++;
        }
        // Change the audio element source
        playlistPlayer.src = PlayerList[current];
        document.getElementById('music_title').innerHTML = "<strong>"+TitleList[current]+"</strong>";
    }
    function PressBack() {
        // Check for last media in the playlist
       if (current == 0) {
            current = files.length - 1;
        } else {
            current--;
        }
        // Change the audio element source
        playlistPlayer.src = PlayerList[current];
        document.getElementById('music_title').innerHTML = "<strong>"+TitleList[current]+"</strong>";
    }
    // Check if the player is in the DOM
    if (playlistPlayer === null) {
        throw "Playlist Player does not exists ...";
    } else {
        // Start the player
        playlistPlayer.src = PlayerList[current];
        // Listen for the playback ended event, to play the next media
        playlistPlayer.addEventListener('ended', next, false)
        document.getElementById('next').addEventListener('click', function(){
            PressNext();
        });

        document.getElementById('back').addEventListener('click', function(){
            PressBack();
        });

    }
}

function updateMusicList(){
    document.getElementById("upload_button_text").disabled = true;
    var XHR = new XMLHttpRequest();
    XHR.onreadystatechange = function() {
        if (XHR.readyState == 4 && XHR.status == 200){
            var files = JSON.parse(XHR.responseText);
            //clear list
            var PlayerList=[];
            var TitleList=[];
            //append music into playlist
            console.log();
            var filename, filetitle, data_src="";
            for(i=0;i<files.length;i++){
                filename=files[i].filename;
                data_src="/"+filename;
                //console.log(data_src);
                //console.log(data_src.toString());
                PlayerList.push(data_src.toString());
                filetitle = filename.split(".mp3")[0];
                filetitle = filetitle.split(".wmv")[0];
                TitleList.push(filetitle);
            }
            showMusicPlayer(files, PlayerList, TitleList);
        }
    }
    var formData = new FormData();
    formData.append("case", "2");

    XHR.open('POST', '/index');
    XHR.send(formData);
}

function updateMusicList_upload(files){
    //clear playlist
    var PlayerList=[];
    var TitleList=[];
    //append music into playlist
    var filename, filetitle, data_src="";
    for(i=0;i<files.length;i++){
        filename=files[i].filename;
        data_src="/"+filename;
        //console.log(data_src);
        //console.log(data_src.toString());
        PlayerList.push(data_src.toString());
        filetitle = filename.split(".mp3")[0];
        filetitle = filetitle.split(".wmv")[0];
        TitleList.push(filetitle);
    }
    //console.log(TitleList);
    showMusicPlayer(files, PlayerList, TitleList);
}

function uploadMusic() {
    var XHR = new XMLHttpRequest();
    XHR.onreadystatechange = function() {
        if (XHR.readyState == 4 && XHR.status == 200){
            var responseJson = JSON.parse(XHR.responseText);
            updateMusicList_upload(responseJson);
            document.getElementById('upload_button_text').innerHTML="Upload Music";
        }
    }
    document.getElementById('upload_button_text').innerHTML="Loading...";
    var music_file = document.getElementById("myFile").files[0];
    var formData = new FormData();
    formData.append("case", "1");
    formData.append("file", music_file);

    XHR.open('POST', '/index');
    XHR.send(formData);
}
function uploadButton_enable() {
    if(document.getElementById('myFile').value === '')
        document.getElementById("upload_button_text").disabled = true;
    else{
        document.getElementById("upload_button_text").disabled = false;
    }
}
