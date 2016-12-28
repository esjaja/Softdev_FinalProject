//var activity = JSON.parse(temp);

var months = ["JANUARY","FEBUARY","MARCH","APRIL","MAY","JUNE","JULY","AUGUST","SEPTEMBER","OCTOBER","NOVEMBER","DECEMBER"];
var date = new Date();
var dropdownFlag = true;
var votedateFlag =false;
var votedateList = ["2016-12-26"];
var pre_votedateList = [];
var voteObj = [];
$(document).ready(function(){
	init();
	$('#chatsight').scrollTop(9999999);

/****************** Calendar control ********************/
	
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
	//$('#calendar').on({
	/*$(document.getElementById("calendar") ).on({
		mousewheel : function(){
			if($(document.getElementById("lock")).hasClass('unlock')){
				if(event.deltaY>0)date.setMonth(date.getMonth()+1);
				else date.setMonth(date.getMonth()-1);
				calendarDate(date);
			}
		}
	});*/
	// lock icon & today icon 
/*	$("#dateinfo > i").on('click',function(){
		if($(this).hasClass('repeat')){
			date = new Date();
			calendarDate(date);
		}
		if($(this).hasClass('unlock') || $(this).hasClass('lock')){
			$(this).toggleClass('unlock').toggleClass('lock');
		}
	})*/
/******************* Activity controll ******************/
	//$('#activityTitle').on({
	$(document.getElementById("activityTitle") ).on({
		click : function(){$(this).focus();},
		keypress : function(e){if(e.keyCode==13)e.preventDefault();}
	});

	//$('#activityTitle').blur(function(){
	$(document.getElementById("activityTitle")).blur(function(){
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

	//Edit Description
	//$('#activityDescription').on('click',function(){
	$(document.getElementById('activityDescription')).on('click',function(){
		$(this).focus();
	});
	//$('#activityDescription').blur(function(){
	$(document.getElementById('activityDescription')).blur(function(){
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

/*****************  Menu in activity sight  *************/
	$('#menu > a').click(function(){
		$(this).addClass('active').siblings().removeClass('active');
		var pageid = '#'+$(this).attr("id") + 'Page';
		$(pageid).show().siblings().hide();
	})

/****************	Votes Display Page ******************/
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
		} else if(myState.length==1 && preState.length==0){
			progress.progress('increment');
		}
		/* infomation for back-end update  */
		var voteId = entry.attr("id");
		var option = $(this).text();
		var action = ($(this).hasClass('green'))?'select':'unselect';
		console.log("VOTE ID : " + voteId);
		console.log("Option : " + option + " " + action);
		$.ajax({
			url: "update_vote",
			data: {
				activity_id: document.location.search.slice(6),
				vote_id: voteId,
				option_name: option,
				attend: (action == 'unselect')? 'false': 'true'
			},
			type: "POST",
			dataType: "json",
			success: function(data, textStatus, jqXHR) {
				console.log(data);
				console.log("success to toggle the vote");
				//add the chat message into chat board??
			},
			error: function() {
				console.log("error!!");
			}
		});
	})

	$("#votePage .ui.accordion").on('click','#optionremove',function(e){
		// use entry to get control progress bar and others
		var entry = $(this).parents('.voteEntry');
		/* infomation for back-end update  */
		var voteId = entry.attr("id");
		var option = $(this).val();
		console.log("VOTE ID : " + voteId);
		console.log("Option : " + option);
		$(this).parents('#'+option).remove();
		$.ajax({
			url: "remove_option",
			data: {
				activity_id: document.location.search.slice(6),
				vote_id: voteId,
				option_name: option
			},
			type: "POST",
			dataType: "json",
			success: function(data, textStatus, jqXHR) {
				console.log(data);
				console.log("success to remove the option");
				//add the chat message into chat board??
			},
			error: function() {
				console.log("error!!");
			}
		});
	})

	$("#votePage input").on('keyup',function(e){
		if(e.keyCode==13 && $.trim(this.value).length){
			console.log($.trim(this.value));
			$(this).val('');
		}
	})

/*********************** Rise Vote **********************/
	//modal registration
	$('.coupled.modal')
	  .modal({
	    allowMultiple: false
	  });
	// choose option : 'others' will show second modal
	$('.second.modal')
	  .modal(/*'attach events', '.first.modal .others'*/);

	// arise vote button

	//$('#Vote').click(function(){
	$(document.getElementById('Vote')).click(function(){
		voteObj = newVote();
		voteObj['type']='OTHERS';
		CheckVoteDoneBtn(voteObj);
		$('.second.modal').modal('show');
	});
/**************** Vote OTHER type **************/
	// OTHER
	//$('#askOther').click(function(){
	$(document.getElementById('askOther')).click(function(){
		//console.log("type[OTHERS]");
		voteObj['type']='OTHERS';
	})
	//  Title
	$('.second.modal input.title').on('keyup',function(e){
		if(e.keyCode ==13 && $.trim($(this).val()).length){ // enter
			$(this).val($.trim($(this).val()));
			voteObj['title'] = $.trim($(this).val());
			var index = $('.inputs').index(this) + 1;
         	$('.inputs').eq(index).focus(); // to option input
		}
	})
	$('.second.modal input.title').blur(function(){
		if($.trim($(this).val()).length)
			voteObj['title'] = $.trim($(this).val());
		CheckVoteDoneBtn(voteObj);
	})

	//  Options
	$('.second.modal input.option').on('keyup',function(e){
		if(e.keyCode == 13 && $.trim($(this).val()).length && $.inArray($.trim($(this).val()),voteObj['options'])==-1){
			$('.field.options').append('<a class="ui large label opt">'
					+ $.trim($(this).val()) +
					'<i class="delete icon"></i></a>');
			voteObj['options'].push($.trim($(this).val()));
			console.log("type[OTHERS] options:" + $.trim($(this).val()));
			$(this).val('');
			CheckVoteDoneBtn(voteObj);
		}
	})
	//  Remove Options
	$('.second.modal .field.options').on('click','.delete.icon',function(){
		var itema = $(this).parent('a');
		var index = $('a.ui.label').index(itema)
		//console.log("type[OPTIONS] options removed :" + itema.text());
		voteObj.options.splice(index,1);
		$(this).parent('a').remove();
		CheckVoteDoneBtn(voteObj);
	})

	//  Done, Send Info To Back End
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


/**************[NOT DONE] Days Free/Busy of Everyone ****************/
	/*$('#calendar li.days').not('.disabledDays').popup({
	  	position: 'top center',
		on    : 'click',
		html:'<img class="ui avatar circular image" src="http://graph.facebook.com/100000362912714/picture?type=square"><img class="ui avatar circular image" src="http://graph.facebook.com/100000362912714/picture?type=square">'
	});*/
		// DATE
	//$('#askDate').click(function(){
	$(document.getElementById('VoteDate')).click(function(){
		console.log("type[DATE]");
		$(document.getElementById('Vote')).addClass('disabled');
		pre_votedateList = votedateList.slice(0);
		voteObj['type']='DATE';
		$('.first.modal').modal('hide');
		if(votedateFlag == false){
			$("#calendar").css("height","340pt");
			$("#calendar").append('<div id="temp" style="width:100%;float:right;margin-top:5pt;">'+
				'<div class="ui right pointing red basic label large" style="margin-top:1pt;">'+
      			'Click on dates you want to choose or cancel</div>'+
				'<button class="ui blue button" id="askDateDone" style="float:right" onclick="askDateBtn($(this))">Done</button>'+
				'<button class="ui button" id="askDateCancel" style="float:right" onclick="askDateBtn($(this))">Cancel</button>'+
				'</div>');
		}
		votedateFlag = true;
	})
	$("#calendar li.days").on({
		click: function(){
			var date = $(this).attr('id');
			/* if now is on votedate status, click on days will change backgroundcolor*/
			if(votedateFlag && !$(this).hasClass('disabledDays'))
			{
				/* Check if this date has been choosen */
				var index = $.inArray(date,votedateList);
				if(index == -1){
					votedateList.push(date);
					$(this).addClass('choosedays');
				}else{
					votedateList.splice(index,1);
					$(this).removeClass('choosedays');
				}
			}
			else if($(this).hasClass('choosedays')){
				if($(this).find('img').length==0)
					/* do ajax here , add self img with onclick="imgClick(this) if self not attend , add unattend class. add other that are attend */
					$(this).append('<span class="tooltiptext"><img onclick="imgClick(this)" class="ui avatar circular image unattend" src="http://graph.facebook.com/123456789/picture?type=square"><img onclick="imgClick(this)" class="ui avatar circular image" src="http://graph.facebook.com/123456789/picture?type=square"><img onclick="imgClick(this)" class="ui avatar circular image" src="http://graph.facebook.com/123456789/picture?type=square"><img onclick="imgClick(this)" class="ui avatar circular image" src="http://graph.facebook.com/123456789/picture?type=square"><img onclick="imgClick(this)" class="ui avatar circular image" src="http://graph.facebook.com/123456789/picture?type=square"><img onclick="imgClick(this)" class="ui avatar circular image" src="http://graph.facebook.com/123456789/picture?type=square"><img onclick="imgClick(this)" class="ui avatar circular image" src="http://graph.facebook.com/123456789/picture?type=square"><img onclick="imgClick(this)" class="ui avatar circular image" src="http://graph.facebook.com/123456789/picture?type=square"><img onclick="imgClick(this)" class="ui avatar circular image" src="http://graph.facebook.com/123456789/picture?type=square"><img onclick="imgClick(this)" class="ui avatar circular image" src="http://graph.facebook.com/123456789/picture?type=square"></span>');
				$(this).children('.tooltiptext').toggleClass('show');
			}
		}
	});

	$(document).mouseup(function(e){
		var tooltiptext = $('#calendar .tooltiptext.show');
		console.log($(e.target));
		console.log(tooltiptext);
		var imgs = $('#calendar span')
		if(!tooltiptext.is(e.target))tooltiptext.removeClass('show');
	})
/************************ ADD MEMBER  *********************/
	$(document.getElementById('Add')).click(function(){
		var member_list = [];
		$('div.item.active').each(function(index,data){
			//console.log($('div.item.active')[index].innerHTML.split('>')[1].trim());
			//console.log(data.innerHTML.split('>')[1].trim());
			$(this).remove();
			$('.ui.dropdown.search.selection').dropdown('restore defaults');
			$('#memberList').append('<div id="'+data.id+'" class="item"> <img class="ui avatar image" src="http://graph.facebook.com/'+data.id+'/picture?type=small">'+data.textContent.trim()+'<i class="delete right red large link icon" onclick="removeMember(this)"></i></div>');
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
	$(document.getElementById('addListMenu')).on('click','.item',function(){
			if($(this).hasClass('active'))
				$(this).addClass('selected');
			else
				$(this).removeClass('selected');
	});

	// vote column
	/*$('#voteBoard .item').click(function(){
		$('.item').removeClass('active');
		$(this).addClass('active');
		$('#voteArea').text('This area is gonna to have other usage now');
	})*/

/************************* Chatboard **************************/
	$("#chatMsg").keypress(function(e){
		code = (e.keyCode ? e.keyCode : e.which);
		if (code == 13){
			var text = $(this).val();
			$(this).val('');
			$.ajax({
				url: "add_message",
				data: {
					activity_id: document.location.search.slice(6),
					message: text
				},
				type: "POST",
				dataType: "json",
				success: function(data, textStatus, jqXHR) {
					console.log(data);
					console.log("success to new a message");
					//add the chat message into chat board??
					$('.ui.comments').append(
					  '<div class="comment" id='+data.id+'>'+
	                 ' <a class="avatar"><img src="http://graph.facebook.com/'+data.user_id+'/picture?type=square"></a>'+
	                  '<div class="content">'+
	                      '<a class="author">'+data.user_name+'</a>'+
	                      '<div class="metadata">'+
	                          '<div class="date">just now</div>'+
	                      '</div>'+
						  '<button id="chatremove" value='+data.id+' onclick="removemessage(this.value)"><i class="teal remove icon"></i></button>'+
	                      '<div class="text">'+text+
	                      '</div>'+
	                  '</div>'+
	                  '<div class="ui divider" style="margin: 0pt"></div>'+
	                '</div>');
					$('#chatsight').scrollTop(9999999);
				},
				error: function() {
					console.log("error!!");
				}
			});
		}
	});

});



/***************** FUNCTIONS ***************/
function init(){
	calendarDate(date);
	//initialize the addList dropdown with parameters
	$('.ui.dropdown.search.selection').dropdown({useLabels: false,forceSelection: false});
	//initialize the memberList dropdown with parameters
	$('.ui.dropdown.red.button').dropdown({useLabels: false, action: 'nothing'});
	$('.ui.accordion').accordion();
	// datepicker(jqeuryUI) setting
	$( "#datepicker" ).datepicker(
		{	dateFormat:"yy-mm-dd",
			onSelect: function(dataText,inst){
				voteObj.deadline = dataText;
				CheckVoteDoneBtn(voteObj);
			},
			minDate:0
		}
	);
	// progress initialization for entries of votes
	$(".ui.progress").progress({
		text:{
			active: '{value} of {total} people voted',
			success: 'Everyone has voted!'
		}
	})
	askDateLabel();
}
function newVote(){
	var vote = {"type":"","title":"","options":[],"deadline":""};
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
	/* days selector */ 
	console.log(date);
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
	var firstDay = month_begin.getDay();	// first day of this month is Mon,Tue...(0~6)
	var lastDate = month_end.getDate();	// last day of this month
	var preMonlastDate = pre_month_end.getDate();	// prev month has XX days

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
	for(var i=1 ; i <= lastDate ; i++){
		var index = firstDay + i-1;
		var date_temp = i;
		$(days[index]).removeClass('disabledDays').text(date_temp);
		if(date_temp<10)date_temp='0'+date_temp;
		$(days[index]).attr('id',year + '-' +month + '-' + date_temp);
		if($.inArray($(days[index]).attr('id'),votedateList) != -1){
			$(days[index]).addClass('choosedays tooltip').append('<i class="ui icon idea warn"></i>');
		}
		if($(days[index]).attr('id') == today){
			$(days[index]).addClass('today').append('<p style="color:#D96449;">Today</p>');
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
			console.log("get month success!");
			var thisActivity = document.location.search.slice(6);
			console.log(data);
			data.activities.forEach(function(value,index){
				//console.log(value,index);
				var color = getRandomColor();
				if(thisActivity == value.activity_id)color='purple';
				var name = value.activity_id;
				var datelength = value.date.length;
				console.log('date len ' + datelength);
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
    var colors = ['red','blue','green','olive','gray','orange'];
    var color = colors[Math.floor(Math.random()*100%colors.length)];
    return color;
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

function removemessage(message_id){
	console.log(message_id);
	$("#"+message_id).remove();
	$.ajax({
	  url: "delete_message",
	  data: {
		message_id: message_id
	  },
	  type: "POST",
	  dataType: "json",
	  success: function(data, textStatus, jqXHR) {
		console.log(data);
		console.log("success delete");
	  },
		error: function() {
		console.log("error!!");
	  }
  });
}

function askDateBtn(btn){
	if($(btn).attr('id') == "askDateCancel"){
		console.log('cancel!');
		console.log('reset votedateList to previous!' + pre_votedateList);
		votedateList = pre_votedateList.splice(0);
		console.log(votedateList);
	}
	else if($(btn).attr('id') == "askDateDone"){
		console.log('Done!');
		votedateList.sort();
		console.log('new votedateList is : ' + votedateList);
		askDateLabel();
		//pre_votedateList = votedateList;
	}
	$(btn).parent().remove();
	$(document.getElementById('Vote')).removeClass('disabled');
	$(document.getElementById('calendar')).css('height','300pt');
	votedateFlag = false;
	calendarDate(date);
}
function changeByTimetag(){
	var tag = $(this).text().split('~')[0];
	date = new Date(tag);
	calendarDate(date);
}
function askDateLabel(){
	$('#activityAskDate .labels').empty();
	votedateList.forEach(function(value,index){
		var div = document.createElement('div');
		div.className = "ui label timetag";
		div.innerHTML = value;
		div.onclick = changeByTimetag;
		$('#activityAskDate .labels').append(div);	
	})
}
function removeMember(event){
    console.log(event.parentNode.id);
    //remove and enable add
    $("#"+event.parentNode.id).remove();
    //console.log();
    $('#addListMenu').append('<div id="'+event.parentNode.id+'" class="item"><img class="ui avatar image" src="http://graph.facebook.com/'+event.parentNode.id+'/picture?type=small">'+event.previousSibling.nodeValue+'</div>');

    $.ajax({
      url: "remove_activity_member",
      data: {
        activity_id: document.location.search.slice(6),
	      user_id: event.parentNode.id
	    },
      type: "POST",
        dataType: "json",
      success: function(data, textStatus, jqXHR) {
        console.log(data);
        console.log("Remove member successfully!");
      },
        error: function() {
        console.log("error!!");
      }
    });
}
function imgClick(img){
	var vote_id = 'time_' + document.location.search.slice(6);
	var date_id = $(img).parents('li').attr('id'); //here date is an option
	//here
	/* member not attend - class unatend */ 
	$(img).toggleClass('unattend');
	var action = ($(img).hasClass('unattend'))?'attend':'unattend';
	console.log(vote_id);
	console.log(date_id);
	console.log(action);
	console.log((action == 'unattend')? 'false': 'true');
	$.ajax({
		url: "update_vote",
		data: {
			activity_id: document.location.search.slice(6),
			vote_id: 'time_' + document.location.search.slice(6),
			option_name: $(img).parents('li').attr('id'),
			attend: (action == 'unattend')? 'false': 'true'
		},
		type: "POST",
		dataType: "json",
		success: function(data, textStatus, jqXHR) {
			console.log(data);
			console.log("go or not go successfully");
			//add the chat message into chat board??
		},
		error: function() {
			console.log("error!!");
		}
	});

	/* TODO: update self attend */
	if($(img).hasClass('unattend')){
		console.log('沒空啦');
	}else{
		console.log('可能是有空吧');
	}


}