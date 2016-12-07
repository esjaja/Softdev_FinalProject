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
		$(this).focus();
	});
	$('#activityDescription').blur(function(){
		var text = this.textContent;
 		console.log(text);
 		$.ajax({
 	        url: "edit_activity_title",
 	        data: {
 	            activity_id: document.location.search.slice(6),
 				title: text
 	        },
 	        type: "POST",
	        dataType: "json",
 	        success: function(data, textStatus, jqXHR) {
 				$(this).val(text);
 				console.log("edit title success!");
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
	//$(document).click(function(e){
	//	var target = e.target;
		//if(!$(target).is("#options") && !$(target).next().is("#options")){
	//		$('#options').hide();
	//	}
	//})


//////// modal registration /////////
	$('.coupled.modal')
	  .modal({
	    allowMultiple: false
	  });
	  //// choose others show second modal //// 
	$('.second.modal')
	  .modal('attach events', '.first.modal .others');

////// Vote Button press show modal ////////

	var voteObj;

	$('#Vote').click(function(){
		/// initialization ////
		voteObj = newVote();
		CheckVote(voteObj);


		$('.first.modal').modal('show');
		console.log('Vote push');
	});
//// First step : choose type ////
	$('div > .choose.dates').click(function(){
		console.log("type[DATE]");
		voteObj['type']='DATE';
		$('.first.modal').modal('hide');
		$('.days').not('.disabledDays').addClass('voteDays');
	})

	$('div > .choose.others').click(function(){
		console.log("type[OTHERS]");
		voteObj['type']='OTHERS';
	})

	//// type OTHERS : title ////////
	$('input.title').on('keyup',function(e){
		if(e.keyCode ==13){ // enter
			voteObj['title'] = $(this).val();
			var index = $('.inputs').index(this) + 1;
         	$('.inputs').eq(index).focus(); // to option input
		}
	})
	$('input.title').blur(function(){
		voteObj['title'] = $(this).val();
		console.log('type[OTHERS]title: ' + $(this).val());
		CheckVote(voteObj);
	})
	//// type OTHERS : options //////// 
	$('input.option').on('keyup',function(e){
		if(e.keyCode == 13){
			if($(this).val())
			{
				$('.field.options').append('<a class="ui large label opt">'
						+ $(this).val() + 
						'<i class="delete icon"></i></a>');
				voteObj['options'].push($(this).val());
				console.log("type[OTHERS] options:" + $(this).val());
				$(this).val('');
				CheckVote(voteObj);
			}
		}
	})
	//// type OHTERS : remove options //////
	$('.field.options').on('click','.delete.icon',function(){
		var itema = $(this).parent('a');
		var index = $('a.ui.label').index(itema)
		console.log("type[OPTIONS] options removed :" + itema.text());
		voteObj.options.splice(index,1);
		$(this).parent('a').remove();

		CheckVote(voteObj);
	})

	$( "#datepicker" ).datepicker(
		{
			dateFormat:"yy-mm-dd",
			onSelect: function(dataText,inst){
				voteObj.deadline = dataText;
				CheckVote(voteObj);
			}
		}
	);

	$('.ui.done.button').on('click',function(){
		console.log(voteObj);
	})

	$('#calendar li.days').not('.disabledDays').on('click',function(){
		console.log($(this));
	})

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
		$('.item').removeClass('active');
		$(this).addClass('active');
		$('#voteArea').text('This area is gonna to have other usage now');
	})

});

function init(){
	calendarDate(date);
	//console.log("sort activity by date");
	//activity.sort(function(a,b){return a.date>b.date;});
	//showActivity(activity);
}

function newVote(){
	var vote = {"id":"","activity_id":"","type":"","title":"","options":[],"deadline":""};
	$('input.title').val('');
	$('input.option').val('');
	$('.field.options > a').remove();
	$( "#datepicker" ).datepicker({dateFormat:"yy-mm-dd"}).val('');
	return vote;
}
function CheckVote(vote){
	if(vote.title && vote.options.length && vote.deadline )
	{
		$('.ui.done.button').addClass('approve green').removeClass('disabled');
	}
	else{
		$('.ui.done.button').removeClass('approve green').addClass('disabled');
	}
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

/*
function searchActivity(val){
	var regExp = new RegExp(val,'gi');
	console.log("search regExp:" + regExp);
	$('#activities > .item').each((index, element) => {
		let string = $(element).text();
		console.log(string);
		if(string.match(regExp)!==null) $(element).css('display', 'block');
		else {console.log("noo"); $(element).css('display', 'none');}
	});
	return;
}*/