let cheerio = require('cheerio');
let https = require('https');
const iconv = require("iconv-lite");
let mongoose = require('mongoose');
const Analises_Model = require('./../../models/analysis-model');
const Analis = Analises_Model.analysis_model;

//let exports = module.exports = {};
module.exports.parse =  function (url, urlObject, time){
    https.get(url, (res) => {
        res.pipe(iconv.decodeStream("win1251")).collect((err, body) => {
            if (!err) {
                const $ = cheerio.load(body, {decodeEntities: false});
                let price = $('span[id=price]').text().match("(.*)грн.")[1].trim();
                price = price.replace(/ /g, '');
                let date = new Date;

                let newData = Analis({
                    _id: new mongoose.Types.ObjectId(),
                    url: urlObject,
                    price: price,
                    data: (date.getMonth()+1) + "-" + date.getDate() + "-" + date.getFullYear() + " " + time
                });

                newData.save(function (err) {
                    if (err) throw err;
                    console.log('Analyse created!');
                });
            }
        })
    }).on('error', () => console.log('errored'));
};


