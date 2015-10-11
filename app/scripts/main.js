(function(dweetio, Chart, moment, $) {
  'use strict';
	
  var iotName = 'henrik_binggl_raspi_temp';
  var interval = 10000;
  
  var ctx = document.getElementById('tempChart').getContext('2d');
  Chart.defaults.global.responsive = true;
  
	dweetio.get_all_dweets_for(iotName, function(err, dweets) {
    
    if(err) {
      console.error('Error occured: ' + err);
      return;
    }
  
    var labelsForValues = [];
    var tempValues = [];
    
    // display the dweets of the last 12 hours
    var now = moment();
    var start = moment();
    start.subtract(4, 'hours');
    
    var info = 'Will display data from <b>' + start.format('DD.MM.YYYY HH:mm:ss') + '</b> to <b>' + now.format('DD.MM.YYYY HH:mm:ss') + '</b> (update interval ' + (interval/1000) + ' seconds)';
    $('#subtext').html(info);
    var i=0;
    for(i = 0; i<dweets.length; i++)
    {
      var dweetDate = moment(dweets[i].created);
      if(dweetDate.isAfter(start)) {
        labelsForValues.push(moment(dweets[i].created).format('HH:mm:ss'));
        tempValues.push(dweets[i].content.temp);
      }
    }
    
    labelsForValues = labelsForValues.reverse();
    tempValues = tempValues.reverse();    
      
    var data = {
        labels: labelsForValues,
        datasets: [
            {
                label: 'Temperature',
                fillColor: 'rgba(255,148,2,0.2)',
                strokeColor: 'rgba(220,220,220,1)',
                pointColor: 'rgba(255,130,13,1)',
                pointStrokeColor: '#fff',
                pointHighlightFill: '#f00',
                pointHighlightStroke: 'rgba(255,0,0,1)',
                data: tempValues
            }
        ]
    };
        
    var tempChart = new Chart(ctx).Line(data, {});
    var lastDweet = null;
    
    // after this initial setup - fetch the latest values
    setInterval(function() {
      dweetio.get_latest_dweet_for(iotName, function(error, dweet) {
        if(error) {
          console.error('Error occured: ' + error);
          return;
        }
        
        
        if(lastDweet && moment(dweet[0].created).isAfter(moment(lastDweet.created))) {
          tempChart.addData([dweet[0].content.temp], moment(dweet[0].created).format('HH:mm:ss'));
          tempChart.removeData();
          console.info('[Update values]: ' + dweet[0].content.temp);
        } else {
          console.log('[Interval: ' + (interval/1000) + ']: ... nothing new');
        }
        lastDweet = dweet[0];
      });  
    }, interval);
  });
  console.info('application loaded - ready to go!');
	
})(window.dweetio, window.Chart, window.moment, window.$);
