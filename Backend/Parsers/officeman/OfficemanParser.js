var cheerio = require('cheerio');
var https = require('https');
const iconv = require("iconv-lite");
let mongoose = require('mongoose');
const Analises_Model = require('./../../models/analysis-model');
const Analis = Analises_Model.analysis_model;

var exports = module.exports = {};


exports.parse =function (url, urlObject) {


     https.get(url, (res) => {
            res.pipe(iconv.decodeStream("UTF-8")).collect((err, body) => {
                if (!err) {
                    const $ = cheerio.load(body, {decodeEntities: false});
                    var price = $('meta[itemprop=price]').attr("content");
                    console.log(url);

                    var date = new Date;

                    let newData = Analis({
                        _id: new mongoose.Types.ObjectId(),
                        url: urlObject,
                        price: price,
                        data: date.getDay() + "-" + date.getMonth() + "-" + date.getFullYear() + " " + date.getHours() + ":" + date.getMinutes()
                    });

                    newData.save(function (err) {
                        if (err) throw err;
                        console.log('Analyse created!');
                    });

                }
            })
        }).on('error', () => console.log('errored'));

}

