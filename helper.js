(function($){
  var month = function(name) {
    return ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'].indexOf(name) + 1;
  }
  var is_date = function(date) {
    var parts = date.split('/');
    if (parts.length == 3) {
       return (! isNaN(parts[0]) && month(parts[1]) > 0 && ! isNaN(parts[2]));
    } else {
       return false;
    } 
  }
  $(document).ready(function() {
    var fail = 'jGantt plugin has been disabled for this board. No issue were detected that conform to plugin requirements, namely - card layout require three fields: Grouping, Start date, End date.';
    $('div.ghx-issue').each(function() {
      var extra = $(this).find('.ghx-extra-field-row');
      if (($(extra[1]).text() != 'None') && $(extra[1]).text().length > 0 && is_date($(extra[1]).text()) && is_date($(extra[2]).text())) {
        fail = '';
      }
    });
    if (fail == '') {
		console.log('ok');
	} else {
		console.log('fail, reason:', fail);
	}
  });
})(jQuery);
