/* If loading separate datasets, install queue.js and launch
queue()
    .defer(d3.json, "/donorschoose/projects")
    .defer(d3.csv, "static/data/googleplaystore_reduced_2.csv")
    .await(makeGraphs);
*/
var dataCount = 0;
d3.csv("static/data/app_dummy_data_small.csv").then(function(dataCsv){
    //Clean dataCsv data
    var dataCsvInitial = dataCsv;

    // Formatters
    var dateFormat = d3.timeFormat("%B %d, %Y");
    var numberFormat = d3.format('.2f');

    // Formatting
    dataCsvInitial.forEach(function(d, i) {
        d.index = i;
        d.age_days = +d.age_days;
        //d.acct_avail_credit = +d.acct_avail_credit;
        d.acct_avail_cash = +d.acct_avail_cash;
        d.acct_curr_crlimit = +d.acct_curr_crlimit;
        d.tot_tran_amt_12 = +d.tot_tran_amt_12;
        d.acct_dayssince_first_acct_open = +d.acct_dayssince_first_acct_open;
        d.med_monthly_tran_amt_12_effective = +d.med_monthly_tran_amt_12_effective; 
        d.tot_tran_amt_child_effective = +d.tot_tran_amt_child_effective;
        d.tot_tran_amt_pharm_hosp_effective = +d.tot_tran_amt_pharm_hosp_effective;
        d.tot_tran_amt_auto_effective = +d.tot_tran_amt_auto_effective;
        d.acct_num_cards_classic_12 = +d.acct_num_cards_classic_12;
        d.acct_num_cards_platinum_12 = +d.acct_num_cards_platinum_12;
        d.score = +d.score;
    });

    //--------------- Create a Crossfilter instance
    var ndx = crossfilter(dataCsvInitial);

    //--------------- Define Dimensions
    var ageDim = ndx.dimension(function(d) { return Math.floor(d.age_days/365.25);});
    // var genderDim = ndx.dimension(function(d) { return d.cust_gender;});
    var maritalDim = ndx.dimension(function(d) { return d.cust_marital_status;});
    var stateDim = ndx.dimension(function(d) { return d.cust_area;});

    //var accAvailCredDim = ndx.dimension(function(d) { return d.acct_avail_credit = 0? 0.01:d.acct_avail_credit;});
    var accCredLimDim = ndx.dimension(function(d) { return d.acct_curr_crlimit;});
    //var totTran12Dim = ndx.dimension(function(d) { return d.tot_tran_amt_12;});

    var scoreDim = ndx.dimension(function(d) { return d.score*100;});
    // var score_w_flagDim = ndx.dimension(function(d) {return Math.floor(d.score_w_axaflags*100);});

    var quantDim = ndx.dimension(function(d) { return d.quantil_rank;});
    //var quant_w_flagDim = ndx.dimension(function(d) { return d.quantil_rank_flag;});

//     var targetDim = ndx.dimension(function(d) { return d.target;});  // COMMENTED as there is no target for this snapshot
    var riskDim = ndx.dimension(function(d) { return d.cust_amla_rind;});

    var unsupSegDim = ndx.dimension(function(d) { return d.cust_unsup_seg;});
    //var pepFlagDim = ndx.dimension(function(d) { return d.cust_pep_flag;});

    var accCashDim = ndx.dimension(function(d) { return d.acct_avail_cash;});
    var nbPlatiCardDim = ndx.dimension(function(d) { return d.acct_num_cards_platinum_12;});
    var acctOpenDaysDim = ndx.dimension(function(d) { return d.acct_dayssince_first_acct_open/365.25;});

    var medExpDim = ndx.dimension(function(d) { return d.med_monthly_tran_amt_12_effective;});
    var childExpDim = ndx.dimension(function(d) { return d.tot_tran_amt_child_effective;});
    var pharmExpDim = ndx.dimension(function(d) { return d.tot_tran_amt_pharm_hosp_effective;});
    var autoExpDim = ndx.dimension(function(d) { return d.tot_tran_amt_auto_effective;});

    var nbClassCardDim = ndx.dimension(function(d) { return d.acct_num_cards_classic_12;});



    //--------------- Define values (to be used in charts)

    //var minAge = Math.floor(ageDim.bottom(1)[0]["age_days"]/365.25);
    //var maxAge = Math.floor(ageDim.top(1)[0]["age_days"]/365.25);

    //var minCred = -1e5;  //Math.floor(accAvailCredDim.bottom(1)[0]["acct_avail_credit"]);
    //var maxCred = 2e6;  //Math.floor(accAvailCredDim.top(1)[0]["acct_avail_credit"]);
    //var minTran = Math.floor(totTran12Dim.bottom(1)[0]["tot_tran_amt_12"]);
    //var maxTran = 2000000;  //Math.floor(totTran12Dim.top(1)[0]["tot_tran_amt_12"]);
    var minCredLim = Math.floor(accCredLimDim.bottom(1)[0]["acct_curr_crlimit"]);
    var maxCredLim = Math.floor(accCredLimDim.top(1)[0]["acct_curr_crlimit"]);  //2000000

    var minCash = 0;  // accCashDim.bottom(1)[0]["acct_avail_cash"];
    var maxCash = accCashDim.top(1)[0]["acct_avail_cash"];  //1.5e6;  

    var minAcctDays = 0;  //acctOpenDaysDim.bottom(1)[0]["acct_dayssince_first_acct_open"]/365.25;
    var maxAcctDays = acctOpenDaysDim.top(1)[0]["acct_dayssince_first_acct_open"]/365.25;

    var minMedExp = 1; //medExpDim.bottom(1)[0]["med_monthly_tran_amt_12_effective"];
    var maxMedExp = medExpDim.top(1)[0]["med_monthly_tran_amt_12_effective"];  // 2e6;  // 

    var minChildExp = 1; //childExpDim.bottom(1)[0]["tot_tran_amt_child_effective"];
    var maxChildExp = childExpDim.top(1)[0]["tot_tran_amt_child_effective"];  //25e3;  //

    var minPharmExp = 1; //pharmExpDim.bottom(1)[0]["tot_tran_amt_pharm_hosp_effective"];
    var maxPharmExp = pharmExpDim.top(1)[0]["tot_tran_amt_pharm_hosp_effective"];  //4e5;  

    var minAutoExp = 1;  //autoExpDim.bottom(1)[0]["tot_tran_amt_auto_effective"];
    var maxAutoExp = autoExpDim.top(1)[0]["tot_tran_amt_auto_effective"];  //7e5;  

    var minNbClassCard = nbClassCardDim.bottom(1)[0]["acct_num_cards_classic_12"];
    var maxNbClassCard = nbClassCardDim.top(1)[0]["acct_num_cards_classic_12"]; //70;

    var minNbPlatiCard = 1;  //nbPlatiCardDim.bottom(1)[0]["acct_num_cards_platinum_12"];
    var maxNbPlatiCard = nbPlatiCardDim.top(1)[0]["acct_num_cards_platinum_12"];  // 50; 

    //--------------- Calculate Groups
    var maritalGrp = maritalDim.group();
//     var targetGrp = targetDim.group();  COMMENTED AS THERE IS NO TARGET FOR THIS SNAPSHOT

    var value_range_score = 1;
    var nb_of_bins_score = 50,
        bin_width_score = value_range_score/nb_of_bins_score;
    var scoreGrp = scoreDim.group(function(d) {return d;});
    // var scoreFlagGrp =  score_w_flagDim.group(function(d) {return d;});
    var ageGrp = ageDim.group(function(d) {return d;});
    var riskGrp = riskDim.group();
    var stateGrp = stateDim.group()
    var quantGrp = quantDim.group()
    // var quantFlagGrp = quant_w_flagDim.group()
    /*
    var value_range_cred = maxCred - minCred;
    var nb_of_bins_cred = 50,
        bin_width_cred = value_range_cred/nb_of_bins_cred;
    var accAvailCredGrp = accAvailCredDim.group(function(d) {return Math.floor(d/bin_width_cred)*bin_width_cred;});
    */
    /*
    var value_range_tran = maxTran - minTran;
    var nb_of_bins_tran = 50,
        bin_width_tran = value_range_tran/nb_of_bins_tran;
    var totTran12Grp = totTran12Dim.group(function(d) {return Math.floor(d/bin_width_tran)*bin_width_tran;});
    */

    var value_range_credlim = maxCredLim - minCredLim;
    var nb_of_bins_credlim = 50,
        bin_width_credlim = value_range_credlim/nb_of_bins_credlim;
    var accCredLimGrp = accCredLimDim.group(function(d) {return Math.floor(d/bin_width_credlim)*bin_width_credlim;});

    var countCredLim = accCredLimDim.group().reduce(
        // callback for when data is added to the current filter results 
        function (p, v) {
            ++p.count;
            p.cred = Math.floor(v.acct_curr_crlimit/bin_width_credlim)*bin_width_credlim;
            p.percent = 100*p.count/all.value();
            return p;
        },
        // callback for when data is removed from the current filter results 
        function (p, v) {
            --p.count;
            p.cred =  Math.floor(v.acct_curr_crlimit/bin_width_credlim)*bin_width_credlim;
            p.percent = 100*p.count/all.value();

            return p;
        },
        // initialize p //
        function () {
            return {
                count: 0, 
                percent :0,
                cred :0,

            };
        }
    );

    var unsupSegGrp = unsupSegDim.group();
    //var pepFlagGrp = pepFlagDim.group();

    var value_range_accCash = maxCash - minCash;
    var nb_of_bins_accCash = 50,
        bin_width_accCash = value_range_accCash/nb_of_bins_accCash;
    var accCashGrp = accCashDim.group(function(d) {return Math.floor(d/bin_width_accCash)*bin_width_accCash;});

    var value_range_acctdays = maxAcctDays - minAcctDays;
    var nb_of_bins_acctdays = 50,
        bin_width_acctdays = value_range_acctdays/nb_of_bins_acctdays;
    var acctOpenDaysGrp = acctOpenDaysDim.group(function(d) {return Math.floor(d/bin_width_acctdays)*bin_width_acctdays;})

    var value_range_medExp = maxMedExp - minMedExp;
    var nb_of_bins_medExp = 20,
        bin_width_medExp = value_range_medExp/nb_of_bins_medExp;
    var medExpGrp = medExpDim.group(function(d) {return Math.floor(d/bin_width_medExp)*bin_width_medExp;}); 

    var value_range_ChildExp = maxChildExp - minChildExp;
    var nb_of_bins_ChildExp = 20,
        bin_width_ChildExp = value_range_ChildExp/nb_of_bins_ChildExp;
    var childExpGrp = childExpDim.group(function(d) {return Math.floor(d/bin_width_ChildExp)*bin_width_ChildExp;});

    var value_range_pharmExp = maxPharmExp - minPharmExp;
    var nb_of_bins_pharmExp = 20,
        bin_width_pharmExp = value_range_pharmExp/nb_of_bins_pharmExp;
    var pharmExpGrp = pharmExpDim.group(function(d) {return Math.floor(d/bin_width_pharmExp)*bin_width_pharmExp;});

    var value_range_autoExp = maxAutoExp - minAutoExp;
    var nb_of_bins_autoExp = 20,
        bin_width_autoExp = value_range_autoExp/nb_of_bins_autoExp;
    var autoExpGrp = autoExpDim.group(function(d) {return Math.floor(d/bin_width_autoExp)*bin_width_autoExp;});

    var value_range_nbClassCard = maxNbClassCard - minNbClassCard;
    var nb_of_bins_nbClassCard = 50,
        bin_width_nbClassCard = value_range_nbClassCard/nb_of_bins_nbClassCard;
    var nbClassCardGrp = nbClassCardDim.group(function(d) {return Math.floor(d/bin_width_nbClassCard)*bin_width_nbClassCard;});

    var value_range_nbPlatiCard = maxNbPlatiCard - minNbPlatiCard;
    var nb_of_bins_nbPlatiCard = 50,
        bin_width_nbPlatiCard = value_range_nbPlatiCard/nb_of_bins_nbPlatiCard;
    var nbPlatiCardGrp = nbPlatiCardDim.group(function(d) {return Math.floor(d/bin_width_nbPlatiCard)*bin_width_nbPlatiCard;});

    /* Example of setting our own map-reduce operation
  	function reduceAdd(p, v) {return v.axa_resp_1st_ind > 0 ? p+1 : p ;}  // define add, remove and initial
  	function reduceRemove(p, v) {return v.axa_resp_1st_ind > 0 ? p-1 : p;}
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
//     var stateRespSumGrp = stateDim.group().reduceSum(function (d) {  // COMMENTED AS THERE IS NO TARGET FOR THIS SNAPSHOT
//         return d.target;
//     });


    /*
    var crlimBPGrp = crlimBPDim.group().reduce(
        function (p, v) {
            // Retrieve the data value, if not Infinity or null add it.

            //let dv = v.acct_avail_credit < 1 ? 0:Math.log(v.acct_curr_crlimit);
            let dv = v.med_monthly_tran_amt_12_effective;
            if (dv != Infinity && dv != null) p.push(dv);
            return p;
        },
        function (p, v) {
            // Retrieve the data value, if not Infinity or null remove it.
            // let dv =  v.acct_avail_credit < 1 ? 0:Math.log(v.acct_curr_crlimit);
            let dv = v.med_monthly_tran_amt_12_effective;
            if (dv != Infinity && dv != null) p.splice(p.indexOf(dv), 1);
            return p;
        },
        function () {
            return [];
        }
    );
    */


    var scoreAgeBBLGrp = unsupSegDim.group().reduce(
        // callback for when data is added to the current filter results 
        function (p, v) {
            ++p.count;

            p.sumAccAge += v.acct_dayssince_first_acct_open/365.25
            p.avgAccAge = p.sumAccAge / p.count;

            p.sumCash += v.acct_avail_cash;
            p.avgCash = p.sumCash / p.count;

            p.sumScore += v.score;
            p.avgScore = p.sumScore / p.count;

            p.sumAge += v.age_days/365.25;
            p.avgAge = p.sumAge / p.count;

            return p;
        },
        // callback for when data is removed from the current filter results 
        function (p, v) {
            --p.count;

            p.sumAccAge -= v.acct_dayssince_first_acct_open/365.25
            p.avgAccAge = p.count ?  p.sumAccAge / p.count:0;

            p.sumCash -= v.acct_avail_cash;
            p.avgCash = p.count ? p.sumCash / p.count:0;

            p.sumScore -= v.score;
            p.avgScore = p.count ? p.sumScore / p.count:0;

            p.sumAge -= v.age_days/365.25;
            p.avgAge = p.count ? p.sumAge / p.count:0;

            return p;
        },
        // initialize p //
        function () {
            return {
                count: 0,
                avgCash:0,
                avgScore:0,
                avgAge:0,
                sumCash:0,
                sumScore:0,
                sumAge:0,
                sumAccAge:0
            };
        }
    );

    //--------------- Grouping values
    var all = ndx.groupAll();
    var all_credlim = accCredLimDim.groupAll();
    var all_acctOpenDays = acctOpenDaysDim.groupAll(); 
    var all_accCash = accCashDim.groupAll();
    var all_unsupSeg = unsupSegDim.groupAll();
    var all_risk = riskDim.groupAll();
    var all_score = scoreDim.groupAll();
    var all_age = ageDim.groupAll();


    //--------------- Charts ph_provinces_small
    d3.json("static/data/geojson/ph_provinces_small.json").then(function (statesJson) {

        // 01-01

        riskBBL = dc.bubbleChart('#risk-bubble-chart') 
        riskBBL
            .width(600)
            .height(250)
            .transitionDuration(500)
            .margins({top: 10, right: 50, bottom: 30, left: 40})
            .dimension(riskDim)
            .group(scoreAgeBBLGrp)
            .colors(d3.schemeRdYlGn[9])
            .colorDomain([0, 1])
            .colorAccessor(function (d) {
            return d.value.avgScore;
        })
            .keyAccessor(function (p) {
            return p.value.avgAge;  //avgAge;
        })
            .valueAccessor(function (p) {
            return p.value.avgScore;
        })
            .radiusValueAccessor(function (p) {
            return p.value.count;
        })
            .maxBubbleRelativeSize(0.1)
            .x(d3.scaleLinear().domain([15, 80]))  //[minAcctDays, maxAcctDays]))
            .y(d3.scaleLinear().domain([0, 1]))
            .r(d3.scaleLinear().domain([0, all.value()]))
            .renderHorizontalGridLines(true)
            .elasticRadius(true)
        //.elasticX(true)
            .yAxisPadding(100)
            .xAxisPadding(500)
            .xAxisLabel('Age in Years')
            .yAxisLabel('Score')
            .renderLabel(true)
            .label(function (p) {
            return p.key;
        })
            .renderTitle(true)
            .title(function (p) {
            return [
                'Behavioral Category: ' + p.key,
                'Average Age in years in the group: ' + numberFormat(p.value.avgAge),
                'Average Score: ' + numberFormat(p.value.avgScore),
                'Count: ' + p.value.count 
            ].join('\n');
        })
            .yAxis().tickFormat(function (v) {
            return v;
        });
        

        /*
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
        */

        // ******************************************************************************************************************

        var creditBar = dc.barChart("#creditDistrib");
        creditBar
            .width(600)
            .height(250)
            .margins({top: 10, right: 50, bottom: 30, left: 50})
            .dimension(accCredLimDim)
            .group(accCredLimGrp) // countCredLim accCredLimGrp
        /*
            .keyAccessor(function (p) {
            return p.value.cred; 
        })
            .valueAccessor(function (p) {
            return p.value.count;
        })
        */
            .transitionDuration(500)
            .x(d3.scaleLinear().domain([minCredLim, maxCredLim]))
            .xUnits(function(){return nb_of_bins_credlim;})
            .elasticY(true)
            .brushOn(true)
            .xAxisLabel("Credit Limit")
            .yAxis().tickFormat(function (d) {
            return 100*d/all_credlim.value() + '%';
        });

        creditBar
            .on("pretransition", function(){
            // creditBar.elasticY(true);
            creditBar.yAxis().tickFormat(function (d) {

                return Math.trunc(100*d/all_credlim.value()) + '%';

            });
        });

        /*
        creditBar
            .filterHandler(function (dimension, filters) {
            console.log(filters);
            if (filters.length === 0) {
                // the empty case (no filtering)
                dimension.filter(null);
            } else if (filters.length === 1 && !filters[0].isFiltered) {
                // single value and not a function-based filter
                dimension.filterExact(filters[0]);
            } else if (filters.length === 1 && filters[0].filterType === 'RangedFilter') {
                // single range-based filter
                dimension.filterRange(filters[0]);
            } else {
                // an array of values, or an array of filter objects
                dimension.filterFunction(function (d) {
                    for (var i = 0; i < filters.length; i++) {
                        var filter = filters[i];
                        if (filter.isFiltered && filter.isFiltered(d)) {
                            return true;
                        } else if (filter <= d && filter >= d) {
                            return true;
                        }
                    }
                    return false;
                });
            }
            return filters;
        });
        */

        var acctOpenDaysBar = dc.barChart("#acct-day-open");
        acctOpenDaysBar
            .width(600)
            .height(250)
            .margins({top: 10, right: 50, bottom: 30, left: 50})
            .dimension(acctOpenDaysDim)
            .group(acctOpenDaysGrp)
            .transitionDuration(500)
            .x(d3.scaleLinear().domain([minAcctDays,maxAcctDays]))
            .xUnits(function(){return nb_of_bins_acctdays;})
            .elasticY(true)
            .brushOn(true)
            .xAxisLabel("Years since first account opened")
            .yAxis().tickFormat(function (d) {

            return 100*d/all_acctOpenDays.value() + '%';
        });
        acctOpenDaysBar
            .yAxis().ticks(5);
        acctOpenDaysBar
            .on("pretransition", function(){

            acctOpenDaysBar.elasticY(true);
            acctOpenDaysBar.yAxis().tickFormat(function (d) {

                return Math.trunc(100*d/all_acctOpenDays.value()) + '%';

            });
        });

        var medExpBar = dc.barChart("#medExp");
        medExpBar
            .width(600)
            .height(250)
            .margins({top: 10, right: 50, bottom: 30, left: 50})
            .dimension(medExpDim)
            .group(medExpGrp)
            .transitionDuration(500)
            .x(d3.scaleLinear().domain([minMedExp,maxMedExp]))
            .xUnits(function(){return nb_of_bins_medExp;})
            .elasticY(true)
            .brushOn(true)
            .xAxisLabel("Median of Monthly Expenses")
            .yAxis().ticks(4);

        var pharmExpBar = dc.barChart("#pharmExp");
        pharmExpBar
            .width(600)
            .height(250)
            .margins({top: 10, right: 50, bottom: 30, left: 50})
            .dimension(pharmExpDim)
            .group(pharmExpGrp)
            .transitionDuration(500)
            .x(d3.scaleLinear().domain([minPharmExp,maxPharmExp]))
            .xUnits(function(){return nb_of_bins_pharmExp;})
            .elasticY(true)
            .brushOn(true)
            .xAxisLabel("Pharmacy Expenses")
            .yAxis().ticks(4); 

        var childExpBar = dc.barChart("#childExp");
        childExpBar
            .width(600)
            .height(250)
            .margins({top: 10, right: 50, bottom: 30, left: 50})
            .dimension(childExpDim)
            .group(childExpGrp)
            .transitionDuration(500)
            .x(d3.scaleLinear().domain([minChildExp,maxChildExp]))
            .xUnits(function(){return nb_of_bins_ChildExp;})
            .elasticY(true)
            .brushOn(true)
            .xAxisLabel("Child Expenses in Current Month")
            .yAxis().ticks(4);



        var nbPlatiCardBar = dc.barChart("#nbPlatiCard");
        nbPlatiCardBar
            .width(600)
            .height(250)
            .margins({top: 10, right: 50, bottom: 30, left: 50})
            .dimension(nbPlatiCardDim)
            .group(nbPlatiCardGrp)
            .transitionDuration(500)
            .x(d3.scaleLinear().domain([minNbPlatiCard,maxNbPlatiCard]))
            .xUnits(function(){return nb_of_bins_nbPlatiCard;})
            .elasticY(true)
            .brushOn(true)
            .xAxisLabel("Number of Platinum Cards in last year")
            .yAxis().ticks(4);


        var nbClassCardBar = dc.barChart("#nbClassCard");
        nbClassCardBar
            .width(600)
            .height(250)
            .margins({top: 10, right: 50, bottom: 30, left: 50})
            .dimension(nbClassCardDim)
            .group(nbClassCardGrp)
            .transitionDuration(500)
            .x(d3.scaleLinear().domain([minNbClassCard,maxNbClassCard]))
            .xUnits(function(){return nb_of_bins_nbClassCard;})
            .elasticY(true)
            .brushOn(true)
            .xAxisLabel("Number of Classic Cards in last year")
            .yAxis().ticks(4);

//         var cashAccBar = dc.barChart("#cash");   // COMMENTED BECAUSE FIELD IS NOT OF QUALITY
//         cashAccBar 
//             .width(600)
//             .height(250)
//             .margins({top: 10, right: 50, bottom: 30, left: 50})
//             .dimension(accCashDim)
//             .group(accCashGrp)
//             .transitionDuration(500)
//             .x(d3.scaleLinear().domain([minCash,maxCash]))
//             .xUnits(function(){return nb_of_bins_accCash;})
//         //.x(d3.scaleOrdinal())
//         //.xUnits(dc.units.ordinal)
//             .elasticY(true)
//             .brushOn(true)
//             .xAxisLabel("Cash Available")
//             .yAxis().tickFormat(function (d) {
//             return 100*d/all_accCash.value() + '%';
//         });
//         cashAccBar
//             .on("pretransition", function(){

//             cashAccBar.elasticY(true);
//             cashAccBar.yAxis().tickFormat(function (d) {

//                 return Math.trunc(100*d/all_accCash.value()) + '%';

//             });

//         });

        var autoExpBar = dc.barChart("#autoExp");
        autoExpBar
            .width(600)
            .height(250)
            .margins({top: 10, right: 50, bottom: 30, left: 50})
            .dimension(autoExpDim)
            .group(autoExpGrp)
            .transitionDuration(500)
            .x(d3.scaleLinear().domain([minAutoExp,maxAutoExp]))
            .xUnits(function(){return nb_of_bins_autoExp;})
            .elasticY(true)
        //.brushOn(true)
            .xAxisLabel("Auto Expenses")
            .yAxis().ticks(4);
        autoExpBar.xAxis().ticks(8);




        // ******************************************************************************************************************

        var unsupSegBar = dc.barChart("#unsupSeg");
        unsupSegBar
            .width(300)
            .height(250)
            .margins({top: 10, right: 50, bottom: 30, left: 50})
            .dimension(unsupSegDim)
            .group(unsupSegGrp)
            .transitionDuration(500)
            .x(d3.scaleOrdinal())
            .xUnits(dc.units.ordinal)
            .elasticY(true)
            .xAxisLabel("Unsup Seg")
            .yAxis().tickFormat(function (d) {

            return 100*d/all_unsupSeg.value() + '%';
        });
        unsupSegBar
            .yAxis().ticks(5);
        unsupSegBar
            .on("pretransition", function(){

            unsupSegBar.elasticY(true);
            unsupSegBar.yAxis().tickFormat(function (d) {

                return Math.trunc(100*d/all_unsupSeg.value()) + '%';

            });
        });


        var riskBar = dc.barChart("#risk-status");
        riskBar
            .width(300)
            .height(250)
            .margins({top: 10, right: 50, bottom: 30, left: 50})
            .dimension(riskDim)
            .group(riskGrp)
            .transitionDuration(500)
            .x(d3.scaleOrdinal())
            .xUnits(dc.units.ordinal)
            .elasticY(true)
            .xAxisLabel("Risk Status")
            .yAxis().tickFormat(function (d) {

            return 100*d/all_risk.value() + '%';
        });
        riskBar
            .yAxis().ticks(5);
        riskBar
            .on("pretransition", function(){

            riskBar.elasticY(true);
            riskBar.yAxis().tickFormat(function (d) {

                return Math.trunc(100*d/all_risk.value()) + '%';

            });
        });

//         // 01-02 COMMENTED AS THERE IS NO TARGET IN THIS SNAPSHOT
//         var targetBar = dc.cboxMenu("#target");
//         targetBar
//         //.width(300)
//         //.height(160)
//         //.margins({top: 10, right: 50, bottom: 30, left: 50})
//             .dimension(targetDim)
//             .group(targetGrp)
//         //.transitionDuration(500)
//             .controlsUseVisibility(true);
//         //.x(d3.scaleOrdinal())
//         //.xUnits(dc.units.ordinal)
//         //.elasticY(true)
//         //.xAxisLabel("Target")
//         //.yAxis().ticks(4);

        /*
        var pepFlagtBar = dc.cboxMenu("#pepFlag");
        pepFlagtBar
            .width(300)
            .height(160)
            .dimension(pepFlagDim)
            .group(pepFlagGrp)
            .controlsUseVisibility(true);
        */

        // Map counting positive targets
        var projection = d3.geoEquirectangular()
        .center([126.5,12.8])
        .scale(2000)  // need to understand this parameter

//         var phMap = dc.geoChoroplethChart("#state-map");  // COMMENTED AS THERE IS NO TARGET FOR THIS SNAPSHOT
//         phMap
//             .width(600)
//             .height(500)
//             .dimension(stateDim)
//             .group(stateRespSumGrp)
//             .colors(d3.scaleLinear()
//                     .domain([0, stateRespSumGrp.top(1)[0].value])
//                     .range(["#E2F2FF", "#0061B5"]))

//             .colorCalculator(function (d) { return d ? phMap.colors()(d) : '#ccc'; })
//             .overlayGeoJson(statesJson.features, "state", function (d) {
//             return d.properties.name;
//         })
//             .projection(projection)
//             .valueAccessor(function(kv) {
//             return kv.value;
//         })
//             .title(function (d) {
//             return "State: " + d.key + "\n Positive target: " + numberFormat(d.value ? d.value : "0");
//         })
//             .on("pretransition", function(){

//             phMap.colors(d3.scaleLinear()
//                          .domain([0, stateRespSumGrp.top(1)[0].value])
//                          .range(["#E2F2FF", "#0061B5"])
//                         )
//         });


        // Map displaying number of people
        var phMap_count = dc.geoChoroplethChart("#state-map-count");
        phMap_count /* dc.geoChoroplethChart("#state-map-count"); */
            .width(480)
            .height(500)
            .dimension(stateDim)
            .group(stateGrp)
            .colors(d3.scalePow()
                    .exponent(0.3)
                    .domain([0, stateGrp.top(1)[0].value])
                    .range(["#E2F2FF", "#0061B5"]))


            .colorCalculator(function (d) { return d ? phMap_count.colors()(d) : '#ccc'; })
            .overlayGeoJson(statesJson.features, "state", function (d) {
            return d.properties.name;
        })
            .projection(projection)
            .valueAccessor(function(kv) {
            return kv.value;
        })
            .title(function (d) {
            return "State: " + d.key + "\n Number of customers: " + numberFormat(d.value ? d.value : "0");
        })
            .on("pretransition", function(){

            phMap_count.colors(d3.scalePow()
                               .exponent(0.3)
                               .domain([0, stateGrp.top(1)[0].value])
                               .range(["#E2F2FF", "#0061B5"])
                              )
        });
        /*
            .on("pretransition", function(){
            var e = document.getElementById("mapType");  
            if (e.options[e.selectedIndex].value == "trgt"){
                console.log("target selected");
                console.log(e.options[e.selectedIndex].value);
                phMap_count
                    .dimension(stateDim)
                    .group(stateGrp);

                phMap_count.colors(d3.scalePow()
                                   .exponent(0.3)
                                   .domain([0, stateGrp.top(1)[0].value])
                                   .range(["#E2F2FF", "#0061B5"])
                                  )


            }
            else{
                console.log("ppl count selected");
                console.log(e.options[e.selectedIndex].value);
                phMap_count
                    .dimension(stateDim)
                    .group(stateRespSumGrp);

                phMap_count.colors(d3.scalePow()
                                   .exponent(0.3)
                                   .domain([0, stateRespSumGrp.top(1)[0].value])
                                   .range(["#E2F2FF", "#0061B5"])
                                  )

            }
        });
    */

        // 02-01

        var ageBar = dc.barChart("#age-groups");
        ageBar
            .width(600)
            .height(160)
            .margins({top: 10, right: 50, bottom: 30, left: 50})
            .dimension(ageDim)
            .group(ageGrp)
            .transitionDuration(500)
            .x(d3.scaleLinear().domain([15, 100]))
            .elasticY(true)
            .brushOn(true)
            .xAxisLabel("Age")
            .yAxis().tickFormat(function (d) {

            return 100*d/all_age.value() + '%';
        });
        ageBar
            .yAxis().ticks(4);
        ageBar
            .on("pretransition", function(){

            ageBar.elasticY(true);
            ageBar.yAxis().tickFormat(function (d) {
                
                    return Math.trunc(100*d/all_age.value()) + '%';
                
            });
        });

        // 02-02
        var scoreBar = dc.barChart("#score");
        scoreBar
            .width(600)
            .height(160)
            .margins({top: 10, right: 50, bottom: 30, left: 50})
            .dimension(scoreDim)
            .group(scoreGrp)
            .transitionDuration(500)
            .x(d3.scaleLinear().domain([0, 100]))
            .elasticY(true)
            .brushOn(true)
            .xAxisLabel("Prediction score")
            .yAxis().tickFormat(function (d) {

            return 100*d/all_score.value() + '%';
        });
        scoreBar
            .yAxis().ticks(4);
        scoreBar
            .on("pretransition", function(){

            scoreBar.elasticY(true);
            scoreBar.yAxis().tickFormat(function (d) {

                return Math.trunc(100*d/all_score.value()) + '%';

            });
        });

        // 02-03
        /*
        var creditBar = dc.barChart("#creditDistrib");
        creditBar
            .width(600)
            .height(250)
            .margins({top: 10, right: 50, bottom: 10, left: 60})
            .dimension(accCredLimDim)
            .group(accCredLimGrp)
            .transitionDuration(500)
            .x(d3.scaleLinear()
               .domain([minCredLim, maxCredLim]))
            .xUnits(function(){return nb_of_bins_cred;})
            .elasticY(true)
            .xAxisLabel("Credit Limit")
            .yAxis().ticks(3);
        creditBar
            .xAxis().ticks(4);
        */
        /*
        var tranBar = dc.barChart("#tranDistrib");
        tranBar
            .width(600)
            .height(160)
            .margins({top: 10, right: 50, bottom: 30, left: 60})
            .dimension(totTran12Dim)
            .group(totTran12Grp)
            .transitionDuration(500)
            .x(d3.scaleLinear()
               .domain([minTran, maxTran]))
            .xUnits(function(){return nb_of_bins_tran;})
            .elasticY(true)
            .xAxisLabel("Transaction Amount")
            .yAxis().ticks(3);
        tranBar
            .xAxis().ticks(4);
        */




        /*
        var scoreFlag = dc.barChart("#score_w_flag");
        scoreFlag
            .width(600)
            .height(160)
            .margins({top: 10, right: 50, bottom: 30, left: 50})
            .dimension(score_w_flagDim)
            .group(scoreFlagGrp)
            .transitionDuration(500)
            .x(d3.scaleLinear().domain([0, 100]))
        //.xUnits(dc.units.integers)
            .elasticY(true)
            .xAxisLabel("Score with flags")
            .yAxis().ticks(4);
        */

        var maritalPiechart = dc.pieChart("#pie-marital-status"); 
        maritalPiechart
            .width(300)
            .height(160)
        //.slicesCap(4)
            .innerRadius(20)
            .dimension(maritalDim)
            .group(maritalGrp)
            .transitionDuration(500)
        //.externalLabels(10)
            .minAngleForLabel(1)
            .cx(200)
        //.drawPaths(true)
            .legend(dc.legend().legendText(function(d, i) { return d.name + ":" + Math.floor(d.data / all.value() * 100) + '%'; }))
            .label(function (d) {
            if (maritalPiechart.hasFilter() && !maritalPiechart.hasFilter(d.key)) {
                return d.key + '(0%)';
            }
            var label = d.key;
            if (all.value()) {
                label += '(' + Math.floor(d.value / all.value() * 100) + '%)';
            }
            return label;
        })
        // workaround for #703: not enough data is accessible through .label() to display percentages

            .on('pretransition', function(chart) {
            //console.log(stateGrp.top(1)[0].value)
        });

        var quantButton = dc.cboxMenu("#quantileRank");
        quantButton
            .dimension(quantDim)
            .group(quantGrp)
            .controlsUseVisibility(true);
        quantButton
            .title(function (d){
                  return d.key;
        });
        // quantButton.attr("transform","rotate(90 200 200)");
        /* 
       var quantBar = dc.barChart("#quant-bar");
		quantBar
	      		.width(600)
	      		.height(160)
	      		.margins({top: 10, right: 50, bottom: 30, left: 50})
	      		.dimension(quantDim)
	      		.group(quantGrp)
	      		.transitionDuration(500)
	      		.x(d3.scaleOrdinal())
	      		.xUnits(dc.units.ordinal)
	      		.elasticY(true)
	      		.xAxisLabel("Quantiles")
	      		.yAxis().ticks(4);

        var quantFlagBar = dc.barChart("#quant-bar-flag");
		quantFlagBar
	      		.width(600)
	      		.height(160)
	      		.margins({top: 10, right: 50, bottom: 30, left: 50})
	      		.dimension(quant_w_flagDim)
	      		.group(quantFlagGrp)
	      		.transitionDuration(500)
	      		.x(d3.scaleOrdinal())
	      		.xUnits(dc.units.ordinal)
	      		.elasticY(true)
	      		.xAxisLabel("Quantiles with Flag model")
	      		.yAxis().ticks(4);
        */
        var rowCount = dc.dataCount(".dc-data-count");
        rowCount
            .width(300)
            .crossfilter(ndx)
            .groupAll(all)
            .html({
            some: '<strong>%filter-count</strong> selected out of <strong>%total-count</strong> records' +
            ' | <a href=\'javascript:dc.filterAll(); dc.renderAll();\'>Reset All</a>',
            all: 'All records selected. Please click on the graphs to apply filters.'
        });
        /*
        var boxChart = dc.boxPlot("#boxplot-credit")
        boxChart
            .width(300)
            .height(300)
            .margins({top: 10, right: 50, bottom: 30, left: 70})
            .dimension(credBPDim)
            .group(credBPGrp)
            .elasticY(true)
            .elasticX(true)
            .showOutliers(false)
            .mouseZoomable(true);
        */
        /*
        var boxChart_2 = dc.boxPlot("#boxplot-credlim")
        boxChart_2
            .width(300)
            .height(300)
            .margins({top: 10, right: 50, bottom: 30, left: 70})
            .dimension(crlimBPDim)
            .group(crlimBPGrp)
            .elasticY(true)
            .elasticX(true)
            .showOutliers(false);
            */


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
        // Utility functions
        function linspace(start, end, n) {
            var out = [];
            var delta = (end - start) / (n - 1);

            var i = 0;
            while(i < (n - 1)) {
                out.push(start + (i * delta));
                i++;
            }

            out.push(end);
            return out;
        }

        // reusable function to create threshold dimension
        /*
    function coreCount_from_threshold() {
        var scoreThreshold=document.getElementById('slideRange').value;
        scoreThreshold=parseFloat(scoreThreshold);
        if (isNaN(scoreThreshold)) {
            scoreThreshold=100
        }
        console.log(scoreThreshold)
        return scoreThreshold;
    }

        function zoomed() {
            projection
                .translate(d3.event.translate)
                .scale(d3.event.scale);
            geoChart.render();
        }

        //## change slider score value to re-assign the data
    function updateSlider(slideValue) {
        var sliderDiv = document.getElementById("sliderValue");
        sliderDiv.innerHTML = slideValue;
        coreCount.dispose();
        threshold = coreCount_from_threshold();
        coreCountGroup = scoreDim.group().top(scoreThreshold);
        // goodYesNoPieChart
            //.dimension(coreCount)
            //.group(coreCountGroup);
        dc.redrawAll();
    }
    */
    });

});


