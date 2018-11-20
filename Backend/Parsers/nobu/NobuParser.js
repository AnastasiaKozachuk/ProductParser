var cheerio = require('cheerio');
var https = require('https');
const iconv = require("iconv-lite");
var exports = module.exports = {};

exports.parse = function (url){
    https.get(url, (res) => {
        res.pipe(iconv.decodeStream("UTF-8")).collect((err, body) => {
            if (!err) {
                const $ = cheerio.load(body, {decodeEntities: false});
                var price = $('span[itemprop=price]').text();
                console.log(price);
                return price;
            }
        })
    });
}


