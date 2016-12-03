//var activity = JSON.parse(temp);

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


function searchActivity(val){
	var regExp = new RegExp(val,'g');
	console.log("search regExp:" + regExp);
	$('#activities > .item').each((index, element) => {
		let string = $(element).text();
		console.log(string);
		if(string.match(regExp)!==null) $(element).css('display', 'block');
		else {console.log("noo"); $(element).css('display', 'none');}
	});
	return;
}
