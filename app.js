var svgWidth = 850;
var svgHeight = 600;

var margin = { top: 30, right: 30, bottom: 70, left: 70};

var chartWidth = svgWidth - margin.left - margin.right;
var chartHeight = svgHeight - margin.top - margin.bottom;

var padding = 20;  // Padding around canvas, i.e. replaces the 0 of scale

var svg = d3.select(".chart")
  .append("svg")
  .attr("height", svgHeight)
  .attr("width", svgWidth)
  .append("g")
  .attr("transform", "translate(" + margin.right + ", " + margin.top + ")");

var chart = svg.append("g");

d3.select(".chart")
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

d3.csv("data.csv", function(error, censusData) {

  if (error) throw error;
  
  censusData.forEach(function(xData) {
      xData.poverty = +xData.poverty;
      xData.healthcare = +xData.healthcare;
      xData.income50K = +xData.income50K;
  });

  var xLinearScale = d3.scaleLinear().range([0, chartWidth]);
  var yLinearScale = d3.scaleLinear().range([chartHeight, 0]);

  var xAxis = d3.axisBottom(xLinearScale);
  var yAxis = d3.axisLeft(yLinearScale);

/*  var xValue = function(xData) { return x(xData.poverty);};
  var yValue = function(xData) { return y(xData.healthcare);};
*/
  var xMin;
  var xMax;
  var yMax;

  function findMinAndMax(i) {
    xMin = d3.min(censusData, function(xData) {
        return +xData[i] * 0.8;
    });

    xMax =  d3.max(censusData, function(xData) {
        return +xData[i] * 1.1;
    });

    yMax = d3.max(censusData, function(xData) {
        return +xData.healthcare * 1.1;
    });
  };
    
  var currentAxisXLabel = "poverty";

    // Call findMinAndMax() with 'poverty' as default
  findMinAndMax(currentAxisXLabel);

    // Set the domain of an axis to extend from the min to the max value of the data column
  xLinearScale.domain([xMin, xMax]);
  yLinearScale.domain([0, yMax]);
      
  // Initialize tooltip
  var toolTip = d3
  		.tip()
        .attr("class", "tooltip")
        .html(function(xData) {
            var state = xData.state;
            var poverty = +xData.poverty;
            var income50K = +xData.income50K;
            var healthcare = +xData.healthcare;
            var healthinfo = +xData[currentAxisXLabel];
            var healthString;
            if (currentAxisXLabel === "poverty"){
            	healthString = "Poverty: "
            }
            else {
            	healthString = "Income over $50K: "
            }
            return (state + "<br>" + healthString + healthinfo + 
            	"%<br> Healthcare: " + healthcare + "%");
      });

  chart.call(toolTip);
                

  circles = chart.selectAll("circle")
    .data(censusData)
    .enter()
    .append("circle")
    .attr("cx", function(xData, index) {
        return xLinearScale(+xData[currentAxisXLabel]);
    })
    .attr("cy", function(xData, index) {
        return yLinearScale(xData.healthcare);
    })   
    .attr('r','10')
    .style('fill', "lightblue")
    // add listeners on text too since it is on top of circle
    .on("mouseover", function(xData) {
      toolTip.show(xData);
    })
    // onmouseout event
    .on("mouseout", function(xData, index) {
      toolTip.hide(xData);
    });              
/*     
  circles.append('text')
    .attr("x", function(xData, index) {
        return xLinearScale(+xData[currentAxisXLabel]- 0.08);
    })
    .attr("y", function(xData, index) {
        return yLinearScale(xData.healthcare - 0.2);
    })

    .attr("text-anchor", "middle")
    .text(function(xData){
        return xData.abbr;})
    .attr('fill', 'white')
    .attr('font-size', 9);
*/

  chart.append("g")
       .attr("class", "x axis")
       .attr("transform", "translate(0," + chartHeight + ")")
       .call(xAxis);

  chart.append("text")
       .attr("class", "label")
       .attr("transform", "translate(" + (chartWidth / 2) + " ," + (chartHeight - margin.top+ 60) + ")")
       .style("text-anchor", "middle")
       .attr("class", "axis-text active")
   	   .attr("data-axis-name", "poverty")
       .text('Poverty (%)');

  chart
    .append("text")
    .attr(
      "transform",
      "translate(" + chartWidth / 2 + " ," + (chartHeight + margin.top + 75) + ")"
    )
    // This axis label is inactive by default
    .attr("class", "axis-text inactive")
    .attr("data-axis-name", "income50K")
    .text("Income $50K or higher");

  // Y-axis
   
  chart.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(" + padding + ",0)")
        .call(yAxis);       
                
 
  chart.append("text")
       .attr("class", "label")
       .attr("transform", "rotate(-90)")
       .attr("y", 0 - (margin.left + 4))
       .attr("x", 0 - (chartHeight/ 2))
       .attr("dy", "1em")
       .style("text-anchor", "middle")
       .text('Healthcare (%)');

   function labelChange(clickedAxis) {
    d3
      .selectAll(".axis-text")
      .filter(".active")
      // An alternative to .attr("class", <className>) method. Used to toggle classes.
      .classed("active", false)
      .classed("inactive", true);

    clickedAxis.classed("inactive", false).classed("active", true);
  }

   d3.selectAll(".axis-text").on("click", function() {
    // Assign a variable to current axis
    var clickedSelection = d3.select(this);
    // "true" or "false" based on whether the axis is currently selected
    var isClickedSelectionInactive = clickedSelection.classed("inactive");
    // console.log("this axis is inactive", isClickedSelectionInactive)
    // Grab the data-attribute of the axis and assign it to a variable
    // e.g. if data-axis-name is "poverty," var clickedAxis = "poverty"
    var clickedAxis = clickedSelection.attr("data-axis-name");
    console.log("current axis: ", clickedAxis);

    // The onclick events below take place only if the x-axis is inactive
    // Clicking on an already active axis will therefore do nothing
    if (isClickedSelectionInactive) {
      // Assign the clicked axis to the variable currentAxisLabelX
      currentAxisXLabel = clickedAxis;
      // Call findMinAndMax() to define the min and max domain values.
      findMinAndMax(currentAxisXLabel);
      // Set the domain for the x-axis
      xLinearScale.domain([xMin, xMax]);
      // Create a transition effect for the x-axis
      svg
        .select(".x-axis")
        .transition()
        // .ease(d3.easeElastic)
        .duration(1800)
        .call(xAxis);
      // Select all circles to create a transition effect, then relocate its horizontal location
      // based on the new axis that was selected/clicked
      d3.selectAll("circle").each(function() {
        d3
          .select(this)
          .transition()
          // .ease(d3.easeBounce)
          .attr("cx", function(xData) {
            return xLinearScale(+xData[currentAxisXLabel]);
          })
          .duration(1800);
      });

      // Change the status of the axes. See above for more info on this function.
      labelChange(clickedSelection);
    }
});
});

