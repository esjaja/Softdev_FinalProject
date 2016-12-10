//var activity = JSON.parse(temp);

var months = ["JANUARY","FEBUARY","MARCH","APRIL","MAY","JUNE","JULY","AUGUST","SEPTEMBER","OCTOBER","NOVEMBER","DECEMBER"];
var date = new Date();
var dropdownFlag = true;

$(document).ready(function(){
  //alert(aa);
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
		var text = $(this).val();
 		console.log(text);
 		$.ajax({
      url: "edit_activity_description",
      data: {
        activity_id: document.location.search.slice(6),
 				description: text
			},
      type: "POST",
    	dataType: "json",
      success: function(data, textStatus, jqXHR) {
				$(this).val(text);
				console.log("edit description success!");
      },
    	error: function() {
				$(this).val("Please Try Again.");
      }
		});
	});

	$('#menu a').click(function(){
		$(this).addClass('active').siblings().removeClass('active');
		var pageid = '#'+$(this).attr("id") + 'Page';
		$(pageid).show().siblings().hide();
	})

	// controll bar behavior //
	$('#Add').click(function(){
		var member_list = [];
		$('div.item.active').each(function(index,data){
			//console.log($('div.item.active')[index].innerHTML.split('>')[1].trim());
			//console.log(data.innerHTML.split('>')[1].trim());
			$(this).remove();
			$('.ui.dropdown.search.selection').dropdown('restore defaults');
			$('#memberList').append('<div id="'+data.id+'" class="item"> <img class="ui avatar image" src="http://graph.facebook.com/'+data.id+'/picture?type=small">'+data.textContent.trim()+'</div>');
			//member_list.push(data.innerHTML.split('>')[1].trim());
			//console.log(data.id);
			$.ajax({
	      url: "add_activity_member",
	      data: {
	        activity_id: document.location.search.slice(6),
	 				user_id: data.id
				},
	      type: "POST",
	    	dataType: "json",
	      success: function(data, textStatus, jqXHR) {
	      	console.log(data);
					console.log("success to add member");
	      },
	    	error: function() {
					console.log("error!!");
	      }
			});
		});
		//console.log(member_list);
	});

	//add selected effect
	$('#addListMenu').on('click','.item',function(){
			if($(this).hasClass('active'))
				$(this).addClass('selected');
			else
				$(this).removeClass('selected');
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
	});
});

function init(){
	calendarDate(date);
	//initialize the addList dropdown with parameters
	$('.ui.dropdown.search.selection').dropdown({useLabels: false,forceSelection: false});
	//initialize the memberList dropdown with parameters
	$('.ui.dropdown.floating.labeled').dropdown({useLabels: false, action: 'nothing'});
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

