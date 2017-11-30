function drawChart(data, id, width, height, stFlag){
    $('#'+id).html('');
    
    var i, j, chart, totalValue = 0;
    var verticalFontSize = 20, HorizontalFontSize = 10, countryFontSize = 15;
    var between = width/20;
    var startX = verticalFontSize*2;
    var startY = countryFontSize*2;
    var endY = HorizontalFontSize*2;
    chart = d3.select('#'+id)
        .append('svg')
        .attr('width', width)
        .attr('height', height)
        .append('g');

    var chartWidth = width - (between+3)*(data.length-1) - startX - HorizontalFontSize*2;
    var chartHeight = height - startY - endY;
    var byVertY = (chartHeight-verticalFontSize)/5;
    var byAgeY = (chartHeight-verticalFontSize)/100;

    for(i = 0; i < data.length; i++){
        if(stFlag == true){
            data[i].push(0);
        }else{
            data[i][4] = 0;
        }
    }
    for(i = 0; i < data.length; i++){
        for(j = 0; j < data[i][3].length; j++){
            if(data[i][4] < data[i][3][j]){
                data[i][4] = data[i][3][j];
            }
        }
        data[i][4] = getFirstValue(data[i][4]);
        if(stFlag == true){
            data[i].push(getSimpleValue(data[i][4]));
        }else{
            data[i][5] = getSimpleValue(data[i][4]);
        }
        totalValue += data[i][4];
    }
    var widthRate = chartWidth/totalValue, x = startX;
    for(i = 0; i < data.length; i++){
        var w = data[i][4]*widthRate;
        var y = height - endY;
        if(w < 3){
            w = 3;
        }
        chart.append('rect')
            .attr('x', x)
            .attr('y', y)
            .attr('width', w)
            .attr('height', 1);
        chart.append('text')
            .attr('x', x+w/2)
            .attr('y', startY/2)
            .attr('text-anchor', 'middle')
            .text(data[i][1]);

        var size = HorizontalFontSize*4;
        var tickCount = getTickCount(data[i][5][0], w, size);
        var tickWidth = w/tickCount;
        for(j = 0; j <= tickCount; j++){
            if(j == 0 && tickWidth < size) continue;
            chart.append('text')
                .attr('x', x+tickWidth*j)
                .attr('y', y+HorizontalFontSize*1.5)
                .attr('text-anchor', 'middle')
                .text(data[i][5][0]/tickCount*j+data[i][5][1]);
        }
        for(j = 0; j <= 100; j++){
            var y = byAgeY*(j-1) + startY + verticalFontSize;
            var value = data[i][3][100-j];
            var simpleValue = getSimpleValue(value);
            chart.append('rect')
                .attr('x', x)
                .attr('y', y)
                .attr('width', w/data[i][4]*value)
                .attr('height', byAgeY)
                .attr('fill', Colors[i%4])
                .attr('opacity', 1)
                .attr('age', 100-j)
                .attr('country', data[i][1])
                .attr('value', simpleValue[0].toFixed(2)+simpleValue[1])
                .classed('barchart', true)
                .on('mouseover', function(){
                    var sel = d3.select(this);
                    var age = sel.attr('age');
                    var country = sel.attr('country');
                    var value = sel.attr('value');
                    var x = parseInt(sel.attr('x'))+10;
                    var y = parseInt(sel.attr('y'))-20;
                    var barchart = d3.selectAll('.barchart');
                    barchart.attr('opacity', 0.5);
                    sel.attr('opacity', 1);
                    var tooltip = $('#tooltip');
                    tooltip.html(age+'-year-olds '+country+": "+value);
                    tooltip.css('left', x+"px");
                    tooltip.css('top', y+"px");
                    tooltip.show();
                })
                .on('mouseout', function(){
                    var barchart = d3.selectAll('.barchart');
                    barchart.attr('opacity', 1);
                    var tooltip = $('#tooltip');
                    tooltip.hide();
                });
        }
        x += w+between-2;
    }

    for(i = 0; i < 6; i++){
        var y = byVertY*i + startY + verticalFontSize;
        chart.append('text')
            .attr('x', startX-5)
            .attr('y', y)
            .attr('text-anchor', 'end')
            .attr('font-size', verticalFontSize)
            .text((5-i)*20);
    }
}
function getFirstValue(x){
	x = Math.round(x*1000)/1000;
	var divVal = 1;
	while(Math.abs(x - Math.round(x))>0.0001){
		x *= divVal;
		divVal *= 10;
	}
	x = Math.round(x);
	var str = x.toString();
	for(i = 1; i < str.length; i++){
		if(str[i] != 0){
			break;
		}
	}
	if(i == str.length) return parseInt(str);

	var len = str.length;
	var val = parseInt(str[0])+1;
	for(i = 1; i < str.length; i++){
		val *= 10;
	}
	globalDivVal = divVal;
	return val;
}
function getSimpleValue(x){
    if(x < 1000) return [x, ''];
    if(x < 1000000) return [x/1000, 'K'];
    if(x < 1000000000) return [x/1000000, 'M'];
    if(x < 1000000000000) return [x/1000000000, 'B'];
    return [x/1000000000000, 'T'];
}
function getTickCount(x, width, size){
    if(x % 7 == 0 && width/7 > size) return 7;
    if(x % 5 == 0 && width/5 > size) return 5;
    if(x % 3 == 0 && width/3 > size) return 3;
    if(x % 2 == 0 && width/2 > size) return 2;
    return 1;
}
function buildCheckBox(selectionIndexFlagArr, data){
    var selectionCnt = 0;
    var html = '';
    for(i = 0; i < data.length; i++){
        if(selectionIndexFlagArr[i]){
            selectionCnt ++;
        }
    }
    var ind = 0;
    for(i = 0; i < data.length; i++){
        if(selectionIndexFlagArr[i] == 1){
            var d = data[i];
            if(ind == selectionCnt-1){
                html += '<div class="vzb-show-item vzb-dialog-checkbox vzb-separator">';
            }else{
                html += '<div class="vzb-show-item vzb-dialog-checkbox">';
            }
            html += '<input type="checkbox" class="vzb-show-item-input" id="'+d[0]+'" checked>';
            html += '<label>'+d[1]+'</label></div>';
            ind ++;
        }
    }
    for(i = 0; i < data.length; i++){
        if(selectionIndexFlagArr[i] == 0){
            var d = data[i];
            html += '<div class="vzb-show-item vzb-dialog-checkbox">';
            html += '<input type="checkbox" class="vzb-show-item-input" id="'+d[0]+'">';
            html += '<label>'+d[1]+'</label></div>';
        }
    }
    $('.vzb-show-list').html(html);
}
function buildCharts(data, header, width, height, stFlag){
    chartData = header.rows;
    rows = data.rows;
    var i, j;
    for(i = 0; i < chartData.length; i++){
        var tmp = [];
        for(j = 0; j <= 100; j++){
            tmp.push(0);
        }
        if(stFlag == true){
            chartData[i].push(tmp);
        }else{
            chartData[i][3] = tmp;
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
    drawChart(chartData, 'container', width, height, true);
}