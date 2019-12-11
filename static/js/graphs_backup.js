/* If loading separate datasets, install queue.js and launch
queue()
    .defer(d3.json, "/donorschoose/projects")
    .defer(d3.csv, "static/data/googleplaystore_reduced_2.csv")
    .await(makeGraphs);
*/

d3.csv("static/data/app_data.csv").then(function(dataCsv){
//customer_bkey	gender	marital_status	state	nationality	age_days	acct_avail_credit	 acct_avail_cash	tot_tran_amt_emi_book_effective	 tot_tran_amt_effective	 tot_tran_amt_effective_3	 tot_tran_amt_effective_6	 tot_chan_callin_3	 tot_chan_callin_6	 tot_tran_amt_pharm_hosp_effective	 tot_tran_amt_pharm_hosp_effective_3	 tot_tran_amt_pharm_hosp_effective_6	 tot_tran_amt_pharm_hosp_effective_12	 axa_resp_1st_ind	axa_resp_2nd_ind	 axa_resp_3rd_ind	 axa_resp_4th_ind	 axa_resp_5th_ind	 axa_resp_6th_ind	 axa_resp_7th_ind	 axa_resp_8th_ind	 axa_resp_1st_12th_ind	 axa_resp_1st_24th_ind
	//Clean dataCsv data
	var dataCsvInitial = dataCsv;

  // Formatters
  var dateFormat = d3.timeFormat("%B %d, %Y");
  var numberFormat = d3.format('.2f');

  // Formatting
  dataCsvInitial.forEach(function(d, i) {
    d.index = i;
	d.customer_bkey = +d.customer_bkey;
	d.cust_gender = +d.cust_gender;
	d.cust_marital_status = +d.cust_marital_status;
	d.cust_area = +d.cust_area;
		d.age_days = +d.age_days;
		d.acct_avail_credit = +d.acct_avail_credit;
		d.acct_avail_cash = +d.acct_avail_cash;
	/*	d.tot_tran_amt_emi_book_effective = +d.tot_tran_amt_emi_book_effective;
		d.tot_tran_amt_effective = +d.tot_tran_amt_effective;
		d.tot_tran_amt_effective_3 = +d.tot_tran_amt_effective_3;
		d.tot_tran_amt_effective_6 = +d.tot_tran_amt_effective_6;
		d.tot_tran_amt_pharm_hosp_effective = +d.tot_tran_amt_pharm_hosp_effective;
		d.tot_tran_amt_pharm_hosp_effective_3 = +d.tot_tran_amt_pharm_hosp_effective_3;
	  d.tot_tran_amt_pharm_hosp_effective_6 = +d.tot_tran_amt_pharm_hosp_effective_6;
		d.tot_tran_amt_pharm_hosp_effective_12 = +d.tot_tran_amt_pharm_hosp_effective_12;
	*/	d.axa_resp_1st_ind = +d.axa_resp_1st_ind;
		d.score = +d.score;

  });

	//Create a Crossfilter instance
	var ndx = crossfilter(dataCsvInitial);

	//Define Dimensions
  var ageDim = ndx.dimension(function(d) { return Math.floor(d.age_days/365.25);});
	var genderDim = ndx.dimension(function(d) { return d.cust_gender;});
	var maritalDim = ndx.dimension(function(d) { return d.cust_marital_status;});
	var stateDim = ndx.dimension(function(d) { return d.cust_area;});
	/*
	var accAvailCredDim = ndx.dimension(function(d) { return d.acct_avail_credit;});
	var accAvailCashDim = ndx.dimension(function(d) { return d.acct_avail_cash;});
	var tranAmtEmiDim = ndx.dimension(function(d) { return d.tot_tran_amt_emi_book_effective;});
	var tranAmtDim = ndx.dimension(function(d) { return d.tot_tran_amt_effective;});
	var tranAmt3Dim = ndx.dimension(function(d) { return d.tot_tran_amt_effective_3;});
	var tranAmt6Dim = ndx.dimension(function(d) { return d.tot_tran_amt_effective_6;});
	var tranAmtPharmDim = ndx.dimension(function(d) { return d.tot_tran_amt_pharm_hosp_effective;});
	var tranAmtPharm3Dim = ndx.dimension(function(d) { return d.tot_tran_amt_pharm_hosp_effective_3;});
	var tranAmtPharm6Dim = ndx.dimension(function(d) { return d.tot_tran_amt_pharm_hosp_effective_6;});
	var tranAmtPharm12Dim = ndx.dimension(function(d) { return d.tot_tran_amt_pharm_hosp_effective_12;});
	*/
	var scoreDim = ndx.dimension(function(d) { return d.score;});
	var targetDim = ndx.dimension(function(d) { return d.axa_resp_1st_ind;});

	//Calculate metrics
	var maritalGrp = maritalDim.group()
	var targetGrp = targetDim.group()
	var scoreGrp = scoreDim.group(function(d) {return Math.floor(d*10)/10;})
	var ageGrp = ageDim.group(function(d) {return d;})

	/*
	var accAvailCredGrp = accAvailCredDim.group()
	var accAvailCashGrp = accAvailCashDim.group()
	*/

	// tran EMI / tran total

	// Percent change in tran Pharm btw 3 and 6 months

	// Ratio Credit over Cash available

	/*
  function reduceAdd(p, v) {return p + v.delay;}  // define add, remove and initial
  function reduceRemove(p, v) {return p - v.delay;}
  function reduceInitial() {return 0;}

  function reduceAdd_delayed(p, v) {return v.delay > 0 ? p + 1 : p;}  // define add, remove and initial
  function reduceRemove_delayed(p, v) {return v.delay > 0 ? p - 1 : p;}
  function reduceInitial_delayed() {return 0;}

  var delayPerDay = dateGrouping.reduce(reduceAdd,
                                            reduceRemove,
                                           reduceInitial);
  var delaysGrouping = delaysGrouping.reduce(reduceAdd_delayed,
                                            reduceRemove_delayed,
                                           reduceInitial_delayed);
	*/
	var stateRespSumGrp = stateDim.group().reduceSum(function (d) {
	 return d.axa_resp_1st_ind;
	});
	var creditAgeGrp = ageDim.group().reduceSum(function (d) {
	 return d.acct_avail_credit;
	});


	//Define values (to be used in charts)
	/*
	var minDate = dateDim.bottom(1)[0]["date"];
	var maxDate = dateDim.top(1)[0]["date"];
	*/
    //Charts ph_provinces_small

		d3.json("static/data/geojson/ph_provinces_small.json").then(function (statesJson) {

			// 01-01
			var maritalBar = dc.barChart("#marital-status");
		  maritalBar
				.width(300)
				.height(160)
				.margins({top: 10, right: 50, bottom: 30, left: 50})
				.dimension(maritalDim)
				.group(maritalGrp)
				.transitionDuration(500)
		    .x(d3.scaleOrdinal())
		    .xUnits(dc.units.ordinal)
		    .elasticY(true)
				.xAxisLabel("Marital Status")
				.yAxis().ticks(4);

			// 01-02
			var targetBar = dc.barChart("#target");
		  targetBar
				.width(300)
				.height(160)
				.margins({top: 10, right: 50, bottom: 30, left: 50})
				.dimension(targetDim)
				.group(targetGrp)
				.transitionDuration(500)
		    .x(d3.scaleOrdinal())
		    .xUnits(dc.units.ordinal)
		    .elasticY(true)
				.xAxisLabel("Target")
				.yAxis().ticks(4);

			// 01-03
			var phMap = dc.geoChoroplethChart("#state-map");
			var projection = d3.geoEquirectangular()
			  .center([123.5,12.8])
				.scale(2000)  // need to understand this parameter

			phMap.width(600)
							.height(500)
							.dimension(stateDim)
							.group(stateRespSumGrp)
							/*.colors(d3.scaleQuantize().range(["#E2F2FF", "#C4E4FF", "#9ED2FF", "#81C5FF", "#6BBAFF", "#51AEFF", "#36A2FF", "#1E96FF", "#0089FF", "#0061B5"]))*/
							.colorDomain([0, 200])
							/* .colorCalculator(function (d) { return d ? usChart.colors()(d) : '#ccc'; })*/
							.overlayGeoJson(statesJson.features, "state", function (d) {


									return d.properties.name;
							})
					.projection(projection)

					.valueAccessor(function(kv) {
							return kv.value;
					})


							.title(function (d) {
									return "State: " + d.key + "\n Positive target: " + numberFormat(d.value ? d.value : "0");
							})
					;

			// 02-01
			var ageBar = dc.barChart("#age-groups");
	    ageBar
	      .width(600)
	      .height(160)
	      .margins({top: 10, right: 50, bottom: 30, left: 50})
	      .dimension(ageDim)
	      .group(ageGrp)
	      .transitionDuration(500)
	      .x(d3.scaleOrdinal())
	      .xUnits(dc.units.ordinal)
	      .elasticY(true)
	      .xAxisLabel("Age")
	      .yAxis().ticks(4);

			// 02-02
			var scoreBar = dc.barChart("#score");
	    scoreBar
	      .width(600)
	      .height(160)
	      .margins({top: 10, right: 50, bottom: 30, left: 50})
	      .dimension(scoreDim)
	      .group(scoreGrp)
	      .transitionDuration(500)
	      .x(d3.scaleOrdinal())
	      .xUnits(dc.units.ordinal)
	      .elasticY(true)
	      .xAxisLabel("Score")
	      .yAxis().ticks(4);

			// 02-03
			var creditBar = dc.barChart("#creditByAge");
			creditBar
				.width(300)
				.height(160)
				.margins({top: 10, right: 50, bottom: 30, left: 50})
				.dimension(ageDim)
				.group(creditAgeGrp)
				.transitionDuration(500)
				.x(d3.scaleOrdinal())
				.xUnits(dc.units.ordinal)
				.elasticY(true)
				.xAxisLabel("Age")
				.yAxis().ticks(4);

			/*
	    var delayChart = dc.lineChart("#cumulated_delays");
	    delayChart
	      .width(600)
	      .height(160)
	      .x(d3.scaleTime().domain([minDate,maxDate]))
	      .xUnits(d3.timeDay)
	      //.interpolate("linear")
	      //.renderArea(true)
	      //.brushOn(false)
	      //.renderDataPoints(true)
	      //.clipPadding(10)
	      .yAxisLabel("Cumulated delay")
	      .dimension(dateDim)
	      .group(delayPerDay);

	    var pieChart = dc.pieChart("#pie_chart_delays");
	    pieChart
	      .width(300)
	      .height(200)
	      .slicesCap(10)
	      .innerRadius(50)
	      //.externalLabels(20)
	      //.externalRadiusPadding(10)
	      //.drawPaths(true)
	      .dimension(isDelayedDimension)
	      .group(delaysGrouping)
	      .legend(dc.legend());
				*/

				// Rendering
		    dc.renderAll();
		});
		// Utility functions
    // Like d3.time.format, but faster.
    function parseDate(d) {
      return new Date(2001,
          d.substring(0, 2) - 1,
          d.substring(2, 4),
          d.substring(4, 6),
          d.substring(6, 8));
    }
});
