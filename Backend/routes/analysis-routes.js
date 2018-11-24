const Url_Model = require('../models/urls-model');
const Competitor_Model = require('../models/competitor-model');
const Item_Model = require('../models/item-model');
const Analysis_Model = require('../models/analysis-model');

const Url = Url_Model.url_model;
const Competitor = Competitor_Model.competitor_model;
const Item = Item_Model.item_model;
const Analysis = Analysis_Model.analysis_model;

function configureEndpointsAnalysis(app) {

    /*-----------------------------------------------------------
    ||||||||||||||||||||||||||| GET |||||||||||||||||||||||||||||
    -----------------------------------------------------------*/

    app.get('/analysis', async function (req, res) {
        let competitors = await Competitor.find({});
        let items_brands = await Item.find({}, ['brand']);
        let brands = new Set();
        for (let brand of items_brands) {
            brands.add(brand.brand);
        }
        res.render('analysisPage', {
            pageTitle: 'My Analysis',
            competitors: competitors,
            brands: brands
        });
    });

    /*-----------------------------------------------------------
    |||||||||||||||||||||||||| POST |||||||||||||||||||||||||||||
    -----------------------------------------------------------*/

    app.post('/analysis/show', async function (req, res) {
        let param = {};
        param.priceEq = req.body.byPrice; // sign of operation or any other string to show all
        param.site = req.body.byComp; // direct url or "all" as parameter to show all
        param.brand = req.body.byBrand; // name of brand or "all" as parameter to show all
        param.dataFrom = req.body.dateFrom;
        param.dataTo = req.body.dateTill;
        console.log(param);
        let all_analysis_data = await Analysis.find({});
        let result = [];

        for (let analysisObject of all_analysis_data) {
            let u = {};
            let url_competitor = await Url.findOne({ _id: analysisObject.url });
            let site = "";
            let url = url_competitor.url;

            let comp = await Competitor.findOne({ _id: url_competitor.competitor });
            if (comp === null || isEmptyObject(comp)) {
                site = "";
            } else {
                site = comp.site;
            }

            let item = await Item.findOne({ _id: url_competitor.item });
            if (item === null || isEmptyObject(item)) {
                u.id = "";
                u.defprice = "";
            } else {
                u.id = item.id;
                u.name = item.name;
                u.brand = item.brand;
                u.defprice = item.price;
            }

            u.data = [];
            u.data.push(analysisObject.data);
            u.site = site;
            u[analysisObject.data] = {};
            u[analysisObject.data][site] = {};
            u[analysisObject.data][site].price = analysisObject.price;
            u[analysisObject.data][site].url = url;

            result.push(u);

        }
        res.send(dataFormat(result, param));
    });

    function dataFormat(analysisData, parameters) {
        let formatArray = [];
        let curr_id = "";
        let analysisDataLength = analysisData.length;
        while (analysisDataLength > 0) {
            let analysisObject = analysisData[0];
            if (parametersMatching(analysisObject, parameters)) {
                curr_id = analysisObject.id;
                if(curr_id === "33725"){
                    console.log(analysisObject);
                }
                analysisData.splice(0, 1);
                let i = 0;
                while (i < analysisData.length) {
                    if (parametersMatching(analysisData[i], parameters)) {
                        let aData = analysisData[i].data[0];
                        let aSite = analysisData[i].site;
                        if(analysisData[i].id === "33725"){
                            console.log(analysisData[i]);
                        }
                        if (curr_id === analysisData[i].id) {
                            if (analysisObject.data.includes(aData)) {
                                analysisObject[aData][aSite] = {};
                                analysisObject[aData][aSite].price = analysisData[i][aData][aSite].price;
                                analysisObject[aData][aSite].url = analysisData[i][aData][aSite].url;
                            } else {
                                analysisObject.data.push(aData);
                                analysisObject[aData] = {};
                                analysisObject[aData][aSite] = {};
                                analysisObject[aData][aSite].price = analysisData[i][aData][aSite].price;
                                analysisObject[aData][aSite].url = analysisData[i][aData][aSite].url;
                            }
                            analysisData.splice(i, 1);
                        } else {
                            i++;
                        }
                    } else {
                        analysisData.splice(i, 1);
                    }
                }
                analysisObject.data = undefined;
                analysisObject.site = undefined;
                analysisObject.brand = undefined;
                formatArray.push(analysisObject);
            } else {
                analysisData.splice(0, 1);
            }
            analysisDataLength = analysisData.length;

        }
        return formatArray;
    }

    function parametersMatching(object, parameters) {
        let priceMatch = false;
        switch (parameters.priceEq) {
            case ">": {
                if (parseInt(object[object.data][object.site].price, 10) > parseInt(object.defprice, 10)) {
                    priceMatch = true;
                }
                break;
            }
            case "<": {
                if (parseInt(object[object.data][object.site].price, 10) < parseInt(object.defprice, 10)) {
                    priceMatch = true;
                }
                break;
            }
            case ">=": {
                if (parseInt(object[object.data][object.site].price, 10) >= parseInt(object.defprice, 10)) {
                    priceMatch = true;
                }
                break;
            }
            case "<=": {
                if (parseInt(object[object.data][object.site].price, 10) <= parseInt(object.defprice, 10)) {
                    priceMatch = true;
                }
                break;
            }
            case "===": {
                if (parseInt(object[object.data][object.site].price, 10) === parseInt(object.defprice, 10)) {
                    priceMatch = true;
                }
                break;
            }
            default: {
                priceMatch = true;
            }
        }
        let siteMatch = false;
        if (parameters.site === "all") {
            siteMatch = true;
        } else {
            if (object.site === parameters.site) {
                siteMatch = true;
            }
        }
        let brandMatch = false;
        if (parameters.brand === "all") {
            brandMatch = true;
        } else {
            if (object.brand === parameters.brand) {
                brandMatch = true;
            }
        }
        return (priceMatch && siteMatch && brandMatch && dateMatchFrom(object.data, parameters.dataFrom) && dateMatchTo(object.data, parameters.dataTo));
    }

    function dateMatchFrom(date, dateFrom) {
        if (dateFrom === "all") {
            return true;
        }
        let dateParseFrom = dateFrom.split(" ")[0];
        let dateParse = date[0].split(" ")[0];
        dateParse = dateParse.split("-")[1] + "-" + dateParse.split("-")[0] + "-" + dateParse.split("-")[2];
        dateParseFrom = dateParseFrom.split("-")[2] + "-" + dateParseFrom.split("-")[1] + "-" + dateParseFrom.split("-")[0];
        for (let i = 2; i >= 0; i--) {
            if (parseInt(dateParse.split("-")[i], 10) > parseInt(dateParseFrom.split("-")[i], 10)) return true;
            if (parseInt(dateParse.split("-")[i], 10) < parseInt(dateParseFrom.split("-")[i], 10)) {
                return false;
            }
        }
        let timeParseFrom = dateFrom.split(" ")[1];
        let timeParse = date[0].split(" ")[1];
        for (let i = 1; i >= 0; i--) {
            if (parseInt(timeParse.split(":")[i], 10) > parseInt(timeParseFrom.split(":")[i], 10)) return true;
            if (parseInt(timeParse.split(":")[i], 10) < parseInt(timeParseFrom.split(":")[i], 10)) {
                return false;
            }
        }
        return true;
    }

    function dateMatchTo(date, dateTo) {
        if (dateTo === "all") {
            return true;
        }
        let dateParseTo = dateTo.split(" ")[0];
        let dateParse = date[0].split(" ")[0];
        dateParse = dateParse.split("-")[1] + "-" + dateParse.split("-")[0] + "-" + dateParse.split("-")[2];
        dateParseTo = dateParseTo.split("-")[2] + "-" + dateParseTo.split("-")[1] + "-" + dateParseTo.split("-")[0];
        for (let i = 2; i >= 0; i--) {
            if (parseInt(dateParse.split("-")[i], 10) < parseInt(dateParseTo.split("-")[i], 10)) return true;
            if (parseInt(dateParse.split("-")[i], 10) > parseInt(dateParseTo.split("-")[i], 10)) {
                return false;
            }
        }
        let timeParseTo = dateTo.split(" ")[1];
        let timeParse = date[0].split(" ")[1];
        for (let i = 1; i >= 0; i--) {
            if (parseInt(timeParse.split(":")[i], 10) < parseInt(timeParseTo.split(":")[i], 10)) return true;
            if (parseInt(timeParse.split(":")[i], 10) > parseInt(timeParseTo.split(":")[i], 10)) {
                return false;
            }
        }
        return true;
    }
}

function isEmptyObject(obj) {
    for (let key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            return false;
        }
    }
    return true;
}

exports.configureEndpointsAnalysis = configureEndpointsAnalysis;