//var activity = JSON.parse(temp);

var months = ["JANUARY","FEBUARY","MARCH","APRIL","MAY","JUNE","JULY","AUGUST","SEPTEMBER","OCTOBER","NOVEMBER","DECEMBER"];
var date = new Date();
var dropdownFlag = true;

$(document).ready(function(){
	init();

/***** Calendar control *****/
	// change calendar 
	$('#calendar .monthButton').click(function(){
		if(this.id == 'right')date.setMonth(date.getMonth()+1);
		else if(this.id == 'left')date.setMonth(date.getMonth()-1);
		calendarDate(date);
	})
	// change calendar month by mouse scroll
	$('#calendar').on({
		mousewheel : function(){
			console.log(event.deltaY);
			if(event.deltaY>0)date.setMonth(date.getMonth()+1);
			else date.setMonth(date.getMonth()-1);
			calendarDate(date);
		}
	});
/****** edit activity TITLE ******/
	$('#activityTitle').on({
		click : function(){
			$(this).focus();
		},
		keypress : function(e){
			e.preventDefault();
		}
	});

	$('#activityTitle').blur(function(){
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

/****** edit activity DESCRIPTION ******/
	$('#activityDescription').on('click',function(){
		$(this).focus();
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

/***** Change display page between activity info or vote pages *****/
	$('#menu > a').click(function(){
		$(this).addClass('active').siblings().removeClass('active');
		var pageid = '#'+$(this).attr("id") + 'Page';
		$(pageid).show().siblings().hide();
	})

	////// Vote page ///////
	$("#votePage .ui.accordion").on('click','.button',function(e){
		// use entry to get control progress bar and others
		var entry = $(this).parents('.voteEntry');
		var progress = entry.find(".progress");
		// 'preState' and 'myState' are used to check whether 
		// this user has vote any option in this vote.
		var preState = entry.find(".green");
		// change button & self img display
		$(this).toggleClass("green");
		$(this).siblings(".me").toggle('fast');
		var myState = entry.find(".green");
		if(myState.length==0){
			progress.progress('decrement');
		}else if(myState.length==1 && preState.length==0){
			progress.progress('increment');
		}
/* TODO: infomation for back-end update  */
		var voteId = entry.attr("id");
		var option = $(this).text();
		var action = ($(this).hasClass('green'))?'select':'unselect';
		console.log("VOTE ID : " + voteId);
		console.log("Option : " + option + " " + action);
	})
	// progress initialization for entries of votes
	$(".ui.progress").progress({
		text:{
			active: '{value} of {total} people voted',
			success: 'Everyone has voted!'
		}
	})


////// Vote Button press show modal ////////
//////// modal registration /////////
	$('.coupled.modal')
	  .modal({
	    allowMultiple: false
	  });
	  //// choose 'others' -> show second modal ////
	$('.second.modal')
	  .modal('attach events', '.first.modal .others');
/***** arise a New Vote *****/
	var voteObj;
	$('#Vote').click(function(){
		voteObj = newVote();
		CheckVoteDoneBtn(voteObj);
		$('.first.modal').modal('show');
	});
	//// First step : ask what ////
	$('#askDate').click(function(){
		//console.log("type[DATE]");
		voteObj['type']='DATE';
		$('.first.modal').modal('hide');
		$('.days').not('.disabledDays').addClass('');
	})
	$('#askOther').click(function(){
		//console.log("type[OTHERS]");
		voteObj['type']='OTHERS';
	})

	//// title ////////
	$('.second.modal input.title').on('keyup',function(e){
		if(e.keyCode ==13){ // enter
			voteObj['title'] = $(this).val();
			var index = $('.inputs').index(this) + 1;
         	$('.inputs').eq(index).focus(); // to option input
		}
	})
	$('.second.modal input.title').blur(function(){
		voteObj['title'] = $(this).val();
		//console.log('type[OTHERS]title: ' + $(this).val());
		CheckVoteDoneBtn(voteObj);
	})
	//// options ////////
	$('.second.modal input.option').on('keyup',function(e){
		if(e.keyCode == 13){
			if($(this).val())
			{
				$('.field.options').append('<a class="ui large label opt">'
						+ $(this).val() +
						'<i class="delete icon"></i></a>');
				voteObj['options'].push($(this).val());
				console.log("type[OTHERS] options:" + $(this).val());
				$(this).val('');
				CheckVoteDoneBtn(voteObj);
			}
		}
	})
	//// type OHTERS : remove options //////
	$('.second.modal .field.options').on('click','.delete.icon',function(){
		var itema = $(this).parent('a');
		var index = $('a.ui.label').index(itema)
		//console.log("type[OPTIONS] options removed :" + itema.text());
		voteObj.options.splice(index,1);
		$(this).parent('a').remove();
		CheckVoteDoneBtn(voteObj);
	})

	// Jquery datepicker setting
	$( "#datepicker" ).datepicker(
		{	dateFormat:"yy-mm-dd",
			onSelect: function(dataText,inst){
				voteObj.deadline = dataText;
				CheckVoteDoneBtn(voteObj);
			},
			minDate:0
		}
	);

	$('.second.modal .ui.done.button').on('click',function(){
		console.log(voteObj);
		$.ajax({
			url: "create_vote",
			data: {
				activity_id: document.location.search.slice(6),
				options: voteObj.options,
				title: voteObj.title,
				type: voteObj.type,
				deadline: voteObj.deadline
			},
			type: "POST",
			dataType: "json",
			success: function(data, textStatus, jqXHR) {
				console.log(data);
				console.log("success to create vote");
			},
			error: function() {
				console.log("error!!");
			}
		});
	})
/////	END OF VOTE  	//////

	$('#calendar li.days').not('.disabledDays').on('click',function(){
		console.log($(this));
	})

/***** MEMBER ADDING ******/
	$('#Add').click(function(){
		var member_list = [];
		console.log("hi");
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

	/*$('#Back').click(function(){
		console.log('Back push');
	});
	$('#Logout').click(function(){
		console.log('Logout push');
	});*/


	// vote column
	/*$('#voteBoard .item').click(function(){
		$('.item').removeClass('active');
		$(this).addClass('active');
		$('#voteArea').text('This area is gonna to have other usage now');
	})*/
});

function init(){
	calendarDate(date);
	//initialize the addList dropdown with parameters
	$('.ui.dropdown.search.selection').dropdown({useLabels: false,forceSelection: false});
	//initialize the memberList dropdown with parameters
	$('.ui.dropdown.red.button').dropdown({useLabels: false, action: 'nothing'});
	$('.ui.accordion').accordion();
}

function newVote(){
	var vote = {"id":"","activity_id":"","type":"","title":"","options":[],"deadline":""};
	$('.second.modal input.title').val('');
	$('.second.modal input.option').val('');
	$('.second.modal .field.options > a').remove();
	$( "#datepicker" ).datepicker({dateFormat:"yy-mm-dd"}).val('');
	return vote;
}
function CheckVoteDoneBtn(vote){
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
	firstDay = firstDay.getDay();	// first day of this month is Mon,Tue...(0~6)
	lastDate = lastDate.getDate();	// last day of this month
	preMonlastDate = preMonlastDate.getDate();	// prev month has XX days
	$(days).addClass('days');
	// preMonDisplay
	for(var i=0 ; i < firstDay ; i++){
    	$(days[i]).text(preMonlastDate - firstDay + i + 1);
    	$(days[i]).addClass('disabledDays');
	}
	// thisMonth
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
	var regExp = new RegExp(val,'gi');
	console.log("search regExp:" + regExp);
	$('#activities > .item').each((index, element) => {
		let string = $(element).text();
		console.log(string);
		if(string.match(regExp)!==null) $(element).css('display', 'block');
		else {console.log("noo"); $(element).css('display', 'none');}
	});
	return;
}
