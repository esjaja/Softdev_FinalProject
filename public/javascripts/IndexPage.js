//var activity = JSON.parse(activities);

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

	// search and display
	$('#activityList input').on('input',function(){
		var act = searchActivity($(this).val());
		//showActivity(act);
	});

	$('.item').click(function(){
		console.log(this);
	})

	$('#Invite').click(inviteFriendToApp());

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
	var regExp = new RegExp(val,'g');
	console.log("search regExp:" + regExp);
	$('#activities > .item').each((index, element) => {
		let string = $(element).text();
		console.log(string);
		if(string.match(regExp)!==null) {
			$(element).css('display', 'block');
			$(element).next().css('display','block');
		}
		else {console.log("noo"); $(element).css('display', 'none');
		$(element).next().css('display','none');}
	});
	return;
}