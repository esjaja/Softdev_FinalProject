
// temp activity info for test
var temp = '[{"name":"activity1","date":"2016/11/26","description":"Hello~Anyo","activity_id":"1"},\
{"name":"activity2","date":"2016/11/21","description":"Oh~~ohohooh","activity_id":"2"},\
{"name":"activity3","date":"","description":"BTS!BTS!","activity_id":"3"},\
{"name":"activity4","date":"2016/11/22","description":"@W@","activity_id":"4"},\
{"name":"activity5","date":"2016/11/25","description":"Q_O","activity_id":"5"},\
{"name":"activity6","date":"2016/12/21","description":"Say lalalalala","activity_id":"6"},\
{"name":"activity7","date":"2015/3/21",\
"description":"HI~ We are initially sorted by date!<br> You can search activity by date, name, description(case sensitive)",\
"activity_id":"7"}]';
var activity = JSON.parse(temp);

var months = ["JANUARY","FEBUARY","MARCH","APRIL","MAY","JUNE","JULY","AUGUST","SEPTEMBER","OCTOBER","NOVEMBER","DECEMBER"];
var date = new Date();

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
	////////// calendar same as index page ///////////




	// activity Description edition
	$('#activityDescription').on('click',function(){
		this.focus();
	});
	$('#activityDescription').blur(function(){
		// preserve \n
		/*var item = document.getElementById("activityDescription");
		var text = item.innerText || item.textContent;
		text = text.replace(/\\r\\n/g, "<br />");*/
		var text = $(this).val();
		console.log('Update content : ' + (text));
		$(this).val(text);
	});



	// controll bar behavior //
	$('#Edit').click(function(){
		console.log('Edit push');
	});	
	$('#Add').click(function(){
		console.log('Add push');
	});
	$('#Back').click(function(){
		console.log('Back push');
	});
	$('#Logout').click(function(){
		console.log('Logout push');
	});


	// vote column
	$('#voteBoard .item').click(function(){
		//console.log($(this));
		//console.log($('#upcomingActivity .item'));
		$('.item').removeClass('active');
		$(this).addClass('active');
		$('#voteArea').text('Change Column!');
	})

});

function init(){
	calendarDate(date);
	//console.log("sort activity by date");
	//activity.sort(function(a,b){return a.date>b.date;});
	//showActivity(activity);
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
		$(days).addClass('days');
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

function searchActivity(obj,val){
	var objects = [];
	var regExp = new RegExp(val,'g');
	console.log("search regExp:" + regExp);
	for (var i in obj){
		var string = obj[i].date + ' ' + obj[i].description + ' ' + obj[i].name;
		if(string.match(regExp)!=null){
			objects.push(obj[i]);
		}
	}
	return objects;
}