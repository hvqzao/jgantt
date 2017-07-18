(function(){
    var cleanup = function(what) {
		var nodes = document.getElementsByClassName(what);
		while (nodes[0]) {
			nodes[0].parentNode.removeChild(nodes[0]);
		}
	};
	//setTimeout(function() {
	Zepto(function($){

		$('<div class="g4n7t" style="position:absolute;top:0;right:0;bottom:0;left:0;z-index:10;background-color:white">'+
			'<div id="gantt_here" style="position:absolute;top:0;right:0;bottom:0;left:0"></div>'+
		  '</div>').appendTo('body');

		//alert(VERSION);

		var pad = function(number, length) {
			var str = '' + number;
			while (str.length < length) {
				str = '0' + str;
			}   
			return str;
		}

		var month = function(name) {
			return ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'].indexOf(name) + 1;
		}

		var array_equal = function(a1,a2) {
			return (a1.length == a2.length && a1.every(function(v,i) { return v === a2[i]; }));
		}

		Date.prototype.getWeek = function() {
			var determinedate = new Date();
			determinedate.setFullYear(this.getFullYear(), this.getMonth(), this.getDate());
			var D = determinedate.getDay();
			if(D == 0) D = 7;
			determinedate.setDate(determinedate.getDate() + (4 - D));
			var YN = determinedate.getFullYear();
			var ZBDoCY = Math.floor((determinedate.getTime() - new Date(YN, 0, 1, -6)) / 86400000);
			var WN = 1 + Math.floor(ZBDoCY / 7);
			return WN;
		}

		var daysBetween = function(first, second) {
			var one = new Date(first.getFullYear(), first.getMonth(), first.getDate());
			var two = new Date(second.getFullYear(), second.getMonth(), second.getDate());
			var millisecondsPerDay = 1000 * 60 * 60 * 24;
			var millisBetween = two.getTime() - one.getTime();
			var days = millisBetween / millisecondsPerDay;
			return Math.floor(days);
		}

		var white = 'white';
		var gray = 'gray';

		var now = new Date();
		var now_time = now.getTime();

		var today = new Date(now);
		today.setHours(0,0,0,0);
		var today_time = today.getTime();

		var yesterday = new Date(today);
		yesterday.setDate(today.getDate() - 1);
		var yesterday_time = yesterday.getTime();

		var tomorrow = new Date(today);
		tomorrow.setDate(today.getDate() + 1);
		var tomorrow_time = tomorrow.getTime();

		//var tasks = {
		//    data:[
		//        {id:1, text:"Project #1",start_date:"01-04-2013", duration:11,progress: 0.6, open: true}, // , color:"red"
		//        {id:2, text:"Task #1",   start_date:"27-03-2016", duration:5, progress: 1,   open: true, parent:1},
		//    ],
		//    links:[
		//		//{id:1, source:1, target:2, type:"1"},
		//		//{id:2, source:1, target:3, type:"0"},
		//    ]
		//};
		
		var data = [];

		var owners = [];
		$('div.ghx-issue').each(function(){
			var extra = $(this).find('.ghx-extra-field-row');
			var owner = $(extra[0]).text().replace(/FILTER_OUT/,'');
			if (owners.indexOf(owner) == -1) {
				owners.push(owner);
			}
		});

		var owners_added = [];
		//var odd = true;
		$('div.ghx-issue').each(function(){
			var extra = $(this).find('.ghx-extra-field-row');
			if (extra.length < 2) {
				return;
			}
			var color;
			var epic_element = $(this).find('.ghx-highlighted-field span');
			if (epic_element.length > 0) {
				color = $(epic_element[0]).css("background-color");
			}
			var title = $(this).find('.ghx-summary').attr('title');
			var add = false;
			var owner = $(extra[0]).text().replace(/FILTER_OUT/,'');
			var start_date;
			var end_date;
			var duration;
			var progress;
			var start_text = $(extra[1]).text().split('/');
			if (! array_equal(start_text, ['None']) && start_text.length == 3 && ! isNaN(start_text[0]) && month(start_text[1]) > 0 && ! isNaN(start_text[2])) {
				start_date = new Date('20'+start_text[2], month(start_text[1])-1, start_text[0]);
				start_text = pad(start_text[0],2)+'-'+pad(month(start_text[1]),2)+'-20'+start_text[2];
				end_date = new Date(start_date);
                //if (extra.length > 2) {
					var end_text = $(extra[2]).text().split('/');
					if (! array_equal(end_text, ['None']) && end_text.length == 3 && ! isNaN(end_text[0]) && month(end_text[1]) > 0 && ! isNaN(end_text[2])) {
						end_date =  new Date('20'+end_text[2], month(end_text[1])-1, end_text[0]);
					}
                //}
				duration = Math.round((end_date - start_date)/(1000*60*60*24));
				if (duration <= 0) {
					duration = 10;
				}
				duration += 1; // magic number :)
				end_date = new Date(start_date);
				end_date.setDate(start_date.getDate() + duration);

				var start_date_time = start_date.getTime();
				var end_date_time = end_date.getTime();

				//progress = 0;
				if (start_date_time > now_time) {
					progress = 0;
				} else if (start_date_time <= now_time && end_date_time >= now_time) {
				//	console.log(title,start_text, start_date , duration , end_date);
				//}
				//	//progress = 0.5;
					progress = (now_time - start_date_time)/(end_date_time - start_date_time);
				} else {
					progress = 1;
				}

				if (end_date_time > yesterday_time) {
					add = true;
				}
			}
			if (add == true) { 
				//console.log(start_text, add, JSON.stringify({text:title, start_date:start_text, duration:duration, open:true, color:color, progress:progress, parent:owner}));
				if (owners_added.indexOf(owner) == -1) {
					//console.log(owner, owners);
					owners_added.push(owner);
					//odd = !odd;
					//data.push({id:owner, text:owner, odd:odd, owner:true, open: true});
					data.push({id:owner, text:owner, owner:true, open: true});
				}
				//data.push({text:title, odd:odd, start_date:start_text, duration:duration, open:true, color:color, progress:progress, parent:owner}); 
				data.push({text:title, start_date:start_text, duration:duration, open:true, color:color, progress:progress, parent:owner}); 
			}
		});

		gantt.config.row_height = 20;
		gantt.config.readonly = true;
		gantt.config.drag_links = false;
		//gantt.config.drag_move = true;

		gantt.templates.scale_cell_class = function(date){
			if (daysBetween(date, now) == 0) {
				return 'gantt_today';
			}
			if (date.getDay() == 0 || date.getDay() == 6) { 
				return 'gantt_weekend';
			}
		};
		gantt.templates.task_cell_class = function(item,date){
			var result = [];
			//if (item.odd) {
			//	result.push('gantt_odd');
			//}
			//if (item.color == white || item.color == gray) {
			//	return 'gantt_person';
			//}
			if (date.getDay() == 0 || date.getDay() == 6) { 
				result.push('gantt_weekend');
			}
			//if (daysBetween(date, now) == 0) {
			//	result.push('gantt_today');
			//}
			//if (date.getWeek() == today.getWeek()) {
			//	return 'gantt_current_week';
			//}
			return result.join(' ');
		};
		gantt.templates.grid_row_class = function(start, end, task){
			if (task.owner == true) {
				return 'gantt_person_grid';
			}
		};
		//gantt.templates.task_row_class = function(start, end, task){
		//	return 'gantt_custom_row_2';
		//};
		gantt.templates.task_class = function(start, end, task){
			if (task.owner == true) {
				return 'gantt_person_task';
			}
		};

		gantt.init('gantt_here'); 
		gantt.parse({data:data});
		$('.g4n77').remove();
		//gantt.config.drag_progress = true; 

		//gantt.oData.scrollLeft = ((new Date() - gantt.startDate) / (24*60*60000) - 10) * gantt.dayInPixels;
		gantt.showDate(yesterday);

		$('<button style="position:absolute;top:1ex;left:1ex">X</button>')
			.click(function(){
				cleanup("g4n7t");
			})
			.appendTo('div.g4n7t');

		$('<button style="position:absolute;top:1ex;left:18ex">N</button>')
			.click(function(){
				gantt.showDate(yesterday);
			})
			.appendTo('div.g4n7t');

	});
	//}, 3000);	
})();
