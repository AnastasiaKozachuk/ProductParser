var cheerio = require('cheerio');
var https = require('https');
const iconv = require("iconv-lite");

var exports = module.exports = {};

exports.parse =async  function (url){
    var priceRes ;

   await https.get(url, (res) => {
        res.pipe(iconv.decodeStream("win1251")).collect((err, body) => {
            if (!err) {
                const $ = cheerio.load(body, {decodeEntities: false});
                var price = $('div[class=buy_block] span[class=cost]').text();
                priceRes = price;

            }
        })
    });
console.log(priceRes);
   return priceRes;
}
