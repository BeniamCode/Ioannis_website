function switchMenu(){if($('div.img-container').height()-90<=$(window).scrollTop()){$("div.menu-container").addClass('full');}else{$("div.menu-container").removeClass('full');}}
jQuery(function($){switchMenu();$(window).scroll(function(){switchMenu();});});