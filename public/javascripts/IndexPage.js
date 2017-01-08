//var activity = JSON.parse(activities);

var months = ["JANUARY","FEBUARY","MARCH","APRIL","MAY","JUNE","JULY","AUGUST","SEPTEMBER","OCTOBER","NOVEMBER","DECEMBER"];
var date = new Date();
var votedateList = [];
var editdateList = [];
var pre_votedateList = [];
var pre_editdateList = [];
$(document).ready(function(){

    init();

    //Change Month
    $('#calendar .monthButton').click(function(){
        if(this.id == 'right')date.setMonth(date.getMonth()+1);
        else if(this.id == 'left')date.setMonth(date.getMonth()-1);
        else if(this.id == 'today')date = new Date();
        calendarDate(date);
    })
    // change month by click on month labels
    $("#monthLabel > a").on('click',function(){
        date.setMonth($(this).text()-1);
        calendarDate(date);
    })
    $("#activityDate .timetag").on('click',changeByTimetag);

    // change calendar month by mouse scroll
    /*$('#calendar').on('mousewheel',function(){
        console.log(event.deltaY);
        if(event.deltaY>0)date.setMonth(date.getMonth()+1);
        else date.setMonth(date.getMonth()-1);
        calendarDate(date);
    })
*/

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
    /* days selector */
    var days = $('#day li');
    var today = $.datepicker.formatDate('yy-mm-dd', new Date());

    /* use to compute previous month, this month and next month */
    var year = date.getFullYear();
    var month = date.getMonth();

    /* Change label display */
    var monthlabels = $("#monthLabel a");
    var labelColor = monthlabels.eq(month).attr('class').split(' ')[1];
    monthlabels.removeClass('big').eq(month).addClass('big');
    $(document.getElementById('mon')).removeClass().addClass('ui label float-left ' + labelColor).text(months[month]);
    $(document.getElementById('year')).text(year);

    var month_begin = new Date(year,month);
    var month_end = new Date(year,month+1,0);
    var pre_month_end = new Date(year,month,0);
    var next_month_begin = new Date(year,month+1);
    var firstDay = month_begin.getDay();    // first day of this month is Mon,Tue...(0~6)
    var lastDate = month_end.getDate(); // last day of this month
    var preMonlastDate = pre_month_end.getDate();   // prev month has XX days

    /* reset days setting before display */
    $(days).removeClass().addClass('days');

    // preMonDisplay
    if(month<10)month='0'+month;
    for(var i=0 ; i < firstDay ; i++){
        var date_temp = preMonlastDate - firstDay + i + 1;
        $(days[i]).addClass('disabledDays').text(date_temp);
        if(date_temp<10)date_temp='0'+date_temp;
        $(days[i]).attr('id',year + '-' +month + '-' + date_temp);
    }
    // thisMonth
    month = (+month)+1;
    if(month==13){month=1;year+=1;}
    if(month<10)month='0'+month;
    //console.log("FUCK");
    //console.log(editdateList);
    for(var i=1 ; i <= lastDate ; i++){
        var index = firstDay + i-1;
        var date_temp = i;
        $(days[index]).removeClass('disabledDays').text(date_temp);
        if(date_temp<10)date_temp='0'+date_temp;
        $(days[index]).attr('id',year + '-' +month + '-' + date_temp);
        if($.inArray($(days[index]).attr('id'),votedateList) != -1){
            $(days[index]).addClass('choosedays tooltip').append('<i class="ui icon idea warn"></i>');
        }
        if($.inArray($(days[index]).attr('id'), editdateList) != -1){
            $(days[index]).addClass('eventDays');
        }
        if($(days[index]).attr('id') == today){
            $(days[index]).addClass('today').append('<span style="color:#123456;float:right">Today</span>');
        }
    }
    // nextMon
    month = (+month)+1;
    if(month==13){month=1;year+=1;}
    if(month<10)month='0'+month;
    for(var i=firstDay+lastDate; i<= days.length ; i++){
        var date_temp = i - (firstDay+lastDate) +1;
        $(days[i]).addClass('disabledDays').text(date_temp);
        if(date_temp<10)date_temp='0'+date_temp;
        $(days[i]).attr('id',year + '-' +month + '-' + date_temp);
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
            //console.log("get month success!");
            var thisActivity = document.location.search.slice(6);
            console.log(data);
            var color_used = [];
            data.activities.forEach(function(value,index){
                //console.log(value);
                if(value.activity_id === document.location.search.slice(6))return;
                //console.log(value,index);
                var color = getRandomColor();
                while(color_used.indexOf(color)!== -1)color = getRandomColor();
                color_used.push(color);
                //if(thisActivity == value.activity_id)color='purple';
                var name = value.title;
                var datelength = value.date.length;
                //console.log('date len ' + datelength);
                value.date.forEach(function(value2,index2){
                $('#'+value2).append('<div style="background-color:'+color+'" class="activityOnCalendar tooltip">'+'<span class="tooltiptext">'+name+'</span>'+'</div>');})
            })
        },
        error: function() {
            console.log("get month failed! QQ");
        }
    });
}
function getRandomColor() {
    /*var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++ ) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;*/
    var colors = ['red','blue','green','olive','gray','orange','teal','brown','pink','black','yellow','violet'];
    var color = colors[Math.floor(Math.random()*100%colors.length)];
    return color;
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
function changeByTimetag(){
    var tag = $(this).text().split('~')[0];
    date = new Date(tag);
    calendarDate(date);
}