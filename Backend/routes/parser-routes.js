const Url_Model = require('../models/urls-model');
const Competitor_Model = require('../models/competitor-model');

let aTechno = require('../Parsers/a-techno/ATechnoParser');
let mobilluk = require('../Parsers/mobilluk/MobillukParser');
let officeman = require('../Parsers/officeman/OfficemanParser');
let nobu = require('../Parsers/nobu/NobuParser');

const Url = Url_Model.url_model;
const Competitor = Competitor_Model.competitor_model;


function configureEndpointsParser(app) {

    /*-----------------------------------------------------------
    ||||||||||||||||||||||||||| GET |||||||||||||||||||||||||||||
    -----------------------------------------------------------*/

    app.get('/parser', function (req, res) {
        Competitor.find({ active: true }, function (err, docs) {
            console.log(docs);
            res.render('parserPage', {
                pageTitle: 'My Parser',
                competitors: docs
            });
        });
    });


    /*-----------------------------------------------------------
    |||||||||||||||||||||||||| POST |||||||||||||||||||||||||||||
    -----------------------------------------------------------*/

    app.post('/parseOneCompetitor', async function (req, res) {
        Url.find({competitor: req.body._id, active:true}, function (err, docs) {
            if (err) throw err;

            let date = new Date;

            let time = date.getHours() + ":" + date.getMinutes();

            for (let i in docs) {
                parseUrl(docs[i], time);
            }

        }).then(function () {
            res.redirect('/analysis');
        });


    });


    function parseUrl(url, time) {

        let correctUrl = url.url.includes("http:") ? url.url.replace("http", "https") : url.url;

        if (url.url.includes("officeman.ua")) {
            officeman.parse(correctUrl, url, time);
        } else if (url.url.includes("a-techno.com")) {
            aTechno.parse(correctUrl, url, time);
        } else if (url.url.includes("nobu.com.ua")) {
            nobu.parse(correctUrl, url, time);
        } else if (url.url.includes("mobilluck.com")) {
            mobilluk.parse(correctUrl, url, time);
        }

    }


    app.post('/parseAllCompetitors', function (req, res) {

        Url.find({active: true}, function (err, docs) {
            if (err) throw err;

            let date = new Date;

            let time = date.getHours() + ":" + date.getMinutes();

            for (let i in docs) {
                parseUrl(docs[i], time);
            }

        }).then(function () {
            res.redirect('/analysis');
        });

    });
}

exports.configureEndpointsParser = configureEndpointsParser;