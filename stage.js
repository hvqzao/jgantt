(function(){
	var cleanup = function(what) {
		var nodes = document.getElementsByClassName(what);
		var len = nodes.length;
		while (nodes[0]) {
			nodes[0].parentNode.removeChild(nodes[0]);
		}
		return len;
	};
	if (cleanup("g4n7t") > 0) {
		cleanup("g4nt7");
		return;
	}
	var tag = function(tag, attr, callback) {
		var tag = document.createElement(tag);
		for (key in attr) {
			tag.setAttribute(key, attr[key]);
		}
		tag.setAttribute('class', 'g4n7t');
		tag.onload = callback;
		tag.onreadystatechange = function() {
			if (this.readyState == 'complete') {
				callback();
			}
		};
		document.body.appendChild(tag);
	};
	var waterfall = function(tags, callback) {
		if (tags.length > 0) {
			var t = tags.shift();
			for (var i in t) {
				var url = t[i];
				switch (i) {
					case 'js':
						tag('script', {type:'text/javascript', src:url}, function() {
							waterfall(tags, callback);
						});
						break;
					case 'css':
						tag('link', {rel:'stylesheet', href:url}, function() {
							waterfall(tags, callback);
						});
						break;
				}
			}
		} else {
			callback();
		}
	};
	waterfall([
		{js:'RESOURCE_URL/zepto.min.js?v=VERSION'}, {css:'RESOURCE_URL/loading.css?v=VERSION'}
	], function() {
		Zepto(function($){
			$('<div style="position:absolute;top:50%;left:50%;margin-left:-36px;margin-top:-36px;z-index:20" class="g4n77 cssload-thecube">'+
				'<div class="cssload-cube cssload-c1"></div><div class="cssload-cube cssload-c2"></div><div class="cssload-cube cssload-c4"></div><div class="cssload-cube cssload-c3"></div>'+
			  '</div>').appendTo('body');
		});
		waterfall([
			{js:'RESOURCE_URL/dhtmlxgantt.js?v=VERSION'}, {css:'RESOURCE_URL/dhtmlxgantt.css?v=VERSION'},
			{css:'RESOURCE_URL/style.css?v=VERSION'}, {js:'RESOURCE_URL/logic.js?v=VERSION'}
		], function() {
			cleanup("g4nt7");
		});
	});
})();
