//var activity = JSON.parse(temp);

var months = ["JANUARY","FEBUARY","MARCH","APRIL","MAY","JUNE","JULY","AUGUST","SEPTEMBER","OCTOBER","NOVEMBER","DECEMBER"];
var date = new Date();
var dropdownFlag = true;
var votedateFlag =false;
$(document).ready(function(){
	init();

/****************** Calendar control *****************/
	//Change Month
	$('#calendar .monthButton').click(function(){
		if(this.id == 'right')date.setMonth(date.getMonth()+1);
		else if(this.id == 'left')date.setMonth(date.getMonth()-1);
		calendarDate(date);
	})
	// change calendar month by mouse scroll
	//$('#calendar').on({
	$( document.getElementById("calendar") ).on({
		mousewheel : function(){
			console.log(event.deltaY);
			if(event.deltaY>0)date.setMonth(date.getMonth()+1);
			else date.setMonth(date.getMonth()-1);
			calendarDate(date);
		}
	});
	//Edit Title
	//$('#activityTitle').on({
	$( document.getElementById("activityTitle") ).on({
		click : function(){
			$(this).focus();
		},
		keypress : function(e){
			e.preventDefault();
		}
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



/*****************   Menu in activity sight  ******************/
	$('#menu > a').click(function(){
		$(this).addClass('active').siblings().removeClass('active');
		var pageid = '#'+$(this).attr("id") + 'Page';
		$(pageid).show().siblings().hide();
	})

/****************	Votes Display Page *********************/
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


/******************* Rise Vote ********************/
	//modal registration
	$('.coupled.modal')
	  .modal({
	    allowMultiple: false
	  });
	// choose option : 'others' will show second modal
	$('.second.modal')
	  .modal('attach events', '.first.modal .others');
	// [NOT DONE] dim all except calendar, for choose dates ()
	$(".ui.page.dimmer").dimmer({
		opacity:0.4
	});

	// arise vote button
	var voteObj;
	//$('#Vote').click(function(){
	$(document.getElementById('Vote')).click(function(){
		voteObj = newVote();
		CheckVoteDoneBtn(voteObj);
		$('.first.modal').modal('show');
	});
	// choose ask type
	// OTHER
	//$('#askOther').click(function(){
	$(document.getElementById('askOther')).click(function(){
		//console.log("type[OTHERS]");
		voteObj['type']='OTHERS';
	})
	// DATE
	//$('#askDate').click(function(){
	$(document.getElementById('askDate')).click(function(){
		//console.log("type[DATE]");
		voteObj['type']='DATE';
		$('.first.modal').modal('hide');
		$('.days').not('.disabledDays').addClass('');
		$(".ui.page.dimmer").dimmer("show");
		$("#calendar").css("z-index","1002");
		$("#calendar li").popup("false");
		votedateFlag = true;
	})

	// Other Title
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

	// Other Options
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

	// Other Remove Options
	$('.second.modal .field.options').on('click','.delete.icon',function(){
		var itema = $(this).parent('a');
		var index = $('a.ui.label').index(itema)
		//console.log("type[OPTIONS] options removed :" + itema.text());
		voteObj.options.splice(index,1);
		$(this).parent('a').remove();
		CheckVoteDoneBtn(voteObj);
	})

	// Other Done, Send Info To Back End
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
	$('#calendar li.days').not('.disabledDays').popup({
	  	position: 'top center',
		on    : 'click',
		html:'<img class="ui avatar circular image" src="http://graph.facebook.com/100000362912714/picture?type=square"><img class="ui avatar circular image" src="http://graph.facebook.com/100000362912714/picture?type=square">'
	});
	$("#calendar li.days").on({
		click: function(){
			console.log($(this).attr('id'));
		}
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
				},
				error: function() {
					console.log("error!!");
				}
			});
		}
	});
});

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
	var year = date.getFullYear();
	var month = date.getMonth();
	$('#mon').text(months[month]);
	$('#year').text(year);
	var days = $('#day li');
	var month_begin = new Date(year,month);
	var month_end = new Date(year,month+1,0);
	var pre_month_end = new Date(year,month,0);
	var next_month_begin = new Date(year,month+1);
	var firstDay = month_begin.getDay();	// first day of this month is Mon,Tue...(0~6)
	var lastDate = month_end.getDate();	// last day of this month
	var preMonlastDate = pre_month_end.getDate();	// prev month has XX days
	$(days).addClass('days');
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
	if(month==13){
		month=1;year+=1;
	}
	if(month<10)month='0'+month;
	for(var i=1 ; i <= lastDate ; i++){
		var date_temp = i;
		$(days[firstDay + i-1]).removeClass('disabledDays').text(date_temp);
		if(date_temp<10)date_temp='0'+date_temp;
		$(days[firstDay + i-1]).attr('id',year + '-' +month + '-' + date_temp);
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
}
*/

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