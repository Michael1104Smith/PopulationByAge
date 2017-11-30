<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
  	<head>
    	<meta http-equiv="content-type" content="text/html;charset=utf-8">
    	<title>Population By Age</title>
        <link href="//maxcdn.bootstrapcdn.com/font-awesome/4.2.0/css/font-awesome.min.css" media="all" rel="stylesheet" type="text/css">
        <link rel="stylesheet" href="css/jquery-ui.css">
        <link rel="stylesheet" href="css/style.css">
	</head>
	
	<body>
        <div class="left-side">
            <div id="container"></div>
            <label id="tooltip"></label>        
            <div id="slider">
                <div id="custom-handle" class="ui-slider-handle"></div>
            </div>
        </div>
        <div class="right-side">
            <div class="vzb-show-list">
                <div class="vzb-show-item vzb-dialog-checkbox vzb-checked vzb-separator"><input type="checkbox" class="vzb-show-item" id="-show-world-c260" checked><label for="-show-world-c260">World</label></div>
                <div class="vzb-show-item vzb-dialog-checkbox vzb-checked"><input type="checkbox" class="vzb-show-item" id="-show-alb-c260"><label for="-show-alb-c260">Albania</label></div>
                <div class="vzb-show-item vzb-dialog-checkbox"><input type="checkbox" class="vzb-show-item" id="-show-afg-c260"><label for="-show-afg-c260">Afghanistan</label></div>
            </div>
        </div>
        <div class="search_overlay"><i class="fa fa-spinner fa-spin"></i></div>
	</body>
    <script type="text/javascript">
        var Colors = ['#00d7d7', '#e6412f', '#ae8c40', '#df0067'];
        var chartData, rows, countryData;
        var year = 2017;
    </script>
    <script src="js/d3.v4.min.js"></script>
    <script src="js/jquery.js"></script>
    <script src="js/jquery-ui.js"></script>
    <script src="js/script.js"></script>
    <script type="text/javascript">
        $(document).ready(function(){
            var handle = $( "#custom-handle" );
            var width = $('#container').width();
            var height = $('#container').height();
            var selectionIndexFlagArr = [];
            $('body').on('click', function(e){
                var obj = $(e.target);
                if(obj.closest('.vzb-show-item-input').length){
                    var id = obj.attr('id');
                    for(var i = 0; i < countryData.length; i++){
                        if(countryData[i][0] == id){
                            selectionIndexFlagArr[i] = 1-selectionIndexFlagArr[i];
                            break;
                        }
                    }
                    var headerUrl = "https://waffle-server.gapminder.org/api/ddf/ql/?_language=en&from=entities&animatable=year&select_key@=geo;&value@=name&=world/_4region;;&where_$and@_geo=$geo;;;&join_$geo_key=geo&where_geo_$in@=";
                    var dataUrl = "https://waffle-server.gapminder.org/api/ddf/ql/?_language=en&from=datapoints&animatable=year&select_key@=geo&=year&=age;&value@=population;;&where_\$and@_geo=\$geo;&_age=\$age;;;&join_\$geo_key=geo&where_geo_\$in@=";
                    var k = 0;
                    for(var i = 0; i < countryData.length; i++){
                        if(selectionIndexFlagArr[i] == 1){
                            if(k == 0){
                                headerUrl += countryData[i][0];
                                dataUrl += countryData[i][0];
                            }else{
                                headerUrl += "&="+countryData[i][0];
                                dataUrl += "&="+countryData[i][0];
                            }
                            k++;
                        }
                    }
                    headerUrl += ";;;;;&order/_by@=rank;&dataset=open-numbers%252Fddf--gapminder--population";
                    dataUrl += ";;;;&\$age_key=age&where_age_\$nin@=80plus&=100plus;;;;;&order/_by@=year;&dataset=open-numbers%252Fddf--gapminder--population";
                    buildCheckBox(selectionIndexFlagArr, countryData);
                    $('.search_overlay').show();
                    $.post("data.php",{url:headerUrl}).done(function(header){
                        $.post("data.php",{url:dataUrl}).done(function(data){
                            buildCharts(JSON.parse(data), JSON.parse(header), width, height, true);
                            $('.search_overlay').hide();
                        });
                    });
                }
            });
            $( "#slider" ).slider({
                create: function() {
                    handle.text( $( this ).slider( "value" ) );
                },
                slide: function( event, ui ) {
                    handle.text( ui.value );
                    year = ui.value;
                    var i, j;
                    for(i = 0; i < rows.length; i++){
                        for(j = 0; j < chartData.length; j++){
                            for(var k = 0; k <= 100; k++){
                                chartData[j][3][k] = 0;
                            }
                        }
                    }
                    for(i = 0; i < rows.length; i++){
                        for(j = 0; j < chartData.length; j++){
                            if(rows[i][0] == chartData[j][0] && parseInt(rows[i][1]) == year){
                                var age = parseInt(rows[i][2]);
                                chartData[j][3][age] += parseInt(rows[i][3]);
                            }
                        }
                    }
                    drawChart(chartData, 'container', width, height, false);
                },
                min:1950,
                max:2100,
                value: year
            });
            d3.json('data/country.json', function(country){
                countryData = [];
                countryData.push(['world','World','World']);
                var i;
                for(i = 0; i < country.rows.length; i++){
                    countryData.push(country.rows[i]);
                }
                for(i = 0; i < countryData.length; i++){
                    selectionIndexFlagArr.push(0);
                }
                selectionIndexFlagArr[0] = 1;
                buildCheckBox(selectionIndexFlagArr, countryData);
            });
            
            d3.json('data/data.json', function(data){
                d3.json('data/header.json', function(header){
                    buildCharts(data, header, width, height, true);
                });
            });
        });
    </script>
</html>