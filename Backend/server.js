let express = require('express');
let path = require('path');
let morgan = require('morgan');
let bodyParser = require('body-parser');
let favicon = require('serve-favicon');
let mongoose = require('mongoose');
let util = require('util');
let Window = require('window');

const Url_Model = require('./models/urls-model');
const Competitor_Model = require('./models/competitor-model');
const Item_Model = require('./models/item-model');
const Analysis_Model = require('./models/analysis-model');

let aTechno = require('./Parsers/a-techno/ATechnoParser');
let mobilluk = require('./Parsers/mobilluk/MobillukParser');
let officeman = require('./Parsers/officeman/OfficemanParser');
let nobu = require('./Parsers/nobu/NobuParser');

let window = new Window();
const Url = Url_Model.url_model;
const Competitor = Competitor_Model.competitor_model;
const Item = Item_Model.item_model;
const Analysis = Analysis_Model.analysis_model;

function isEmptyObject(obj) {
    for (let key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            return false;
        }
    }
    return true;
}

function configureEndpoints(app) {

    /*-----------------------------------------------------------
    ||||||||||||||||||||||||||| USE |||||||||||||||||||||||||||||
    -----------------------------------------------------------*/

    app.use(express.static(path.join(__dirname, '../Frontend/www')));
    app.use(favicon(path.join(__dirname, '../Frontend/www/assets/images/favicon.ico')));

    /*-----------------------------------------------------------
    ||||||||||||||||||||||||||| GET |||||||||||||||||||||||||||||
    -----------------------------------------------------------*/
    app.get('/',  function (req, res){
        res.render('homePage', {
             pageTitle: 'Welcome'
        });
    });
    app.get('/competitors',  async function (req, res){
        //window.location.reload();
        Competitor.find({},function(err, results){
            res.render('competitorsPage', {
                pageTitle: 'My Competitors',
                competitors: results
            });
        });
    });
    app.get('/items', function (req, res){
        window.location.reload();
        Item.find({}, function (err, docs) {
            console.log(docs);
            res.render('itemPage', {
                pageTitle: 'My Items',
                items: docs
            });
        });
    });
    app.get('/parser', function (req, res){
        Competitor.find({active: true}, function (err, docs) {
            console.log(docs);
            res.render('parserPage', {
                pageTitle: 'My Parser',
                competitors: docs
            });
        });
    });
    app.get('/analysis', async function (req, res){
        let competitors = await Competitor.find({});
        let items_brands = await Item.find({},['brand']);
        let brands = new Set();
        for(let brand of items_brands){
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
    app.post('/item', async function (req, res){
        let item_info = await Item.findOne({_id: req.body._id});
        let all_competitors = await Competitor.find({});
        let results = [];
        for(let i of all_competitors){
            let u = {};
            u.comp_name = i.comp_name;
            u.site = i.site;

            let urls_item = await Url.findOne({item: req.body._id, competitor: i._id});
            if(urls_item === null || isEmptyObject(urls_item)){
                u.url = "";
            }else{
                u.url = urls_item.url;
            }
            console.log(u);
            results.push(u);

        }
        res.render('viewItemPage', {
            pageTitle: 'My Item Competitors',
            competitors: results,
            item: item_info
        });
    });

    app.post('/competitors/data', async function (req, res){
        const keys = Object.keys((req.body)[0]);
        let my_competitors = [];
        for(let i = 3; i<keys.length; i++) {
            //get the site
            const site_name = keys[i].trim();
            if(!my_competitors.includes(site_name)){
                my_competitors.push(site_name);
            }
        }
        for(let competitor of my_competitors){
            let result = await Competitor.findOne({site: competitor});
            if (result === null || isEmptyObject(result)) {
                let newCompetitor = Competitor({
                    _id: new mongoose.Types.ObjectId(),
                    comp_name: competitor,
                    site: competitor
                });
                // save the Competitor
                newCompetitor.save(function (err) {
                    if (err) throw err;
                    console.log('Competitor created!');
                });
            }
        }

        for(let url of req.body){
            if (!isEmptyObject(url)) {
                let item = await Item.findOne({id: url[keys[0]]});
                for(let i = 3; i<keys.length; i++) {
                    let comp = await Competitor.findOne({site: keys[i]});
                    const comp_url = url[keys[i]];
                    let found_url = await Url.find({url: comp_url});
                    if(found_url === null || isEmptyObject(found_url)){
                        let newUrl = Url({
                            item: item._id,
                            competitor: comp._id,
                            url: comp_url,
                            active: item.active
                        });
                        // save the Url
                        newUrl.save(function (err) {
                            if (err) throw err;
                            console.log('Url created!');
                        });
                    }

                }
            }
        }
        res.redirect('/competitors');
    });

    //Analysis load

    app.post('/analysis/show', async function (req, res){

        let all_analysis_data = await Analysis.find({});
        console.log(all_analysis_data);
        let result = [];
        for(let i of all_analysis_data){
            let u = {};

            let url_comp = await Url.findOne({_id: i.url});

            let site = "";
            let comp = await Competitor.findOne({_id: url_comp.competitor});
            if(comp === null || isEmptyObject(comp)){
                site = "";
            }else{
                site = comp.site;
                console.log(comp);
            }

            let item = await Item.findOne({_id: url_comp.item});
            if(item === null || isEmptyObject(item)){
                u.id = "";
                u.defprice = "";
            }else{
                u.id = item.id;
                u.name = item.name;
                u.defprice = item.price;
            }

            u.data = i.data;
            u.site = site;
            u[i.data] = {};
            u[i.data][site] = i.price;

            result.push(u);

        }
        console.log("START!!!");
        let result2 = [];
        let curr_id = "";
        let leng = result.length;
        while(leng>0){
            let o = result[0];
            curr_id = o.id;
            result.splice(0,1);
            let i = 0;
            while( i<result.length){
                if ( curr_id === result[i].id) {
                    if(o.data === result[i].data){
                        console.log(result[i][o.data][result[i].site]);
                        o[o.data][result[i].site]=result[i][o.data][result[i].site];
                    } else {
                        o[result[i].data] = {};
                        o[result[i].data][result[i].site]=result[i][result[i].data][result[i].site];
                    }
                    result.splice(i, 1);
                } else {
                    i++;
                }
            }
            o.data = undefined;
            o.site = undefined;
            result2.push(o);
            leng = result.length;
        }

        res.send(result2);
    });

    app.post('/urls', async function (req, res){
        let all_items = await Item.find({});
        let results = [];
        for(let i of all_items){
            let u = {};
            u.id = i.id;
            u.name = i.name;
            u.vendorCode = i.vendorCode;

            let urls_comp = await Url.findOne({competitor: req.body._id, item: i._id});
            if(urls_comp === null || isEmptyObject(urls_comp)){
                u.url = "";
                u.active = i.active;
            }else{
                u.url = urls_comp.url;
                u.active = urls_comp.active;
            }
            u.active_item = i.active;
            console.log(u);
            results.push(u);

        }
        res.send(results);
    });

    app.post('/items/data', function (req, res){
        console.log("Request: " + util.inspect(req.body, false, null));
        const keys = Object.keys((req.body)[0]);
        (req.body).forEach(item => {
            if(!isEmptyObject(item)){
                Item.find({id: item[keys[0]]}, function (err, docs) {
                    if (!Array.isArray(docs) || !docs.length){
                        let newItem = Item({
                            _id: new mongoose.Types.ObjectId(),
                            id: item[keys[0]],
                            vendorCode: item[keys[1]],
                            name: item[keys[2]],
                            brand: item[keys[3]],
                            price: item[keys[4]]
                        });
                        // save the user
                        newItem.save(function(err) {
                            if (err) throw err;
                            console.log('Item created!');
                        });
                    }
                });
            }
        });
        res.redirect('/items');
    });

    app.post('/additem', function (req, res){
        console.log("/item/create SUCCESS");
            if(req.body.id !== "" || req.body.id !== undefined){
                Item.find({id: req.body.id}, function (err, docs) {
                    if (!Array.isArray(docs) || !docs.length){
                        let newItem = Item({
                            _id: new mongoose.Types.ObjectId(),
                            id: req.body.id,
                            vendorCode: req.body.vendorCode,
                            name: req.body.name,
                            brand: req.body.brand,
                            price: req.body.price
                        });
                        // save the user
                        newItem.save(function(err) {
                            if (err) throw err;
                            console.log('Item created!');
                        });
                    }
                });
            }
        res.redirect('/items');
    });

    app.post('/addcompetitor', function (req, res){
        console.log("/competitor/create SUCCESS");
        if(req.body.site !== "" || req.body.site !== undefined){
            Competitor.find({site: req.body.site}, function (err, docs) {
                if (!Array.isArray(docs) || !docs.length){
                    let newCompetitor = Competitor({
                        _id: new mongoose.Types.ObjectId(),
                        comp_name: (req.body.comp_name !== "" || req.body.comp_name !== undefined)?req.body.comp_name:req.body.site,
                        site: req.body.site
                    });
                    // save the user
                    newCompetitor.save(function(err) {
                        if (err) throw err;
                        console.log('Competitor created!');
                    });
                }
            });
        }
        res.redirect('/competitors');
    });

    app.post('/edititem', function (req, res){
        console.log(req.body.id);
        Item.updateOne(
            { id: req.body.id},
            { $set:
                {
                    name: req.body.name,
                    brand: req.body.brand,
                    price: req.body.price
                }
            }, function(err, res) {
                if (err) throw err;
                console.log("1 document updated");
                console.log(res);
            }
        );
        res.redirect('/items');
    });

    app.post('/editUrlItem', function (req, res){
        console.log(req.body.id);
        Url.updateOne(
            { url: req.body.url},
            { $set:
                    {
                        url: req.body.url
                    }
            }, function(err, res) {
                if (err) throw err;
                console.log("1 document updated");
                console.log(res);
            }
        );
        res.redirect('/item, req.body.id');
    });

    app.post('/editUrlCompetitor', function (req, res){
        console.log(req.body.url);
        Url.updateOne(
            { url: req.body.url},
            { $set:
                    {
                        url: req.body.url
                    }
            }, function(err, res) {
                if (err) throw err;
                console.log("1 document updated");
                console.log(res);
            }
        );
        res.redirect('/competitors');
    });

    app.post('/editcompetitor', function (req, res){
        console.log(req.body.site);
        Competitor.updateOne(
            { site: req.body.site},
            { $set:
                    {
                        comp_name: req.body.comp_name,
                        site: req.body.site
                    }
            }, function(err, res) {
                if (err) throw err;
                console.log("1 document updated");
                console.log(res);
            }
        );
        res.redirect('/competitors');
    });

    app.post('/active-disable', function (req, res){
        let value_bool = (req.body.active !== 'true');

        Item.updateOne(
            { id: req.body.id},
            { $set:
                    {
                        active: value_bool
                    }
            }, function(err, res) {
                if (err) throw err;
                console.log("1 document updated");
                console.log(res);
            }
        );
        res.redirect('/items');
    });

    app.post('/active-disable-url', function (req, res){
        let value_bool = (req.body.active !== 'true');

        Url.updateOne(
            { url: req.body.url},
            { $set:
                    {
                        active: value_bool
                    }
            }, function(err, res) {
                if (err) throw err;
                console.log("1 document updated");
                console.log(res);
            }
        );
        res.redirect('/competitors');
    });

    app.post('/active-disable-competitor', function (req, res){
        let value_bool = (req.body.active !== 'true');

        Competitor.updateOne(
            { site: req.body.site},
            { $set:
                    {
                        active: value_bool
                    }
            }, function(err, res) {
                if (err) throw err;
                console.log("1 document updated");
                console.log(res);
            }
        );
        res.redirect('/competitors');
    });

    app.post('/parseOneCompetitor', function (req, res) {

        Url.find({competitor: req.body._id, active:true}, function (err, docs) {
            if (err) throw err;

            for (var i in docs) {
                parseUrl(docs[i]);
            }

        }).then(function () {
            res.redirect('/parser');
        });


    });


    function parseUrl(url) {

        var correctUrl = url.url.includes("http:") ? url.url.replace("http", "https") : url.url;

        if (url.url.includes("officeman.ua")) {
            officeman.parse(correctUrl, url);
        } else if (url.url.includes("a-techno.com")) {
            aTechno.parse(correctUrl, url);
        } else if (url.url.includes("nobu.com.ua")) {
            nobu.parse(correctUrl, url);
        } else if (url.url.includes("mobilluck.com")) {
            mobilluk.parse(correctUrl, url);
        }

    }


    app.post('/parseAllCompetitors', function (req, res) {

        Url.find({active: true}, function (err, docs) {
            if (err) throw err;

            for (var i in docs) {
                parseUrl(docs[i]);
            }

        }).then(function () {
            res.redirect('/parser');
        });

    });

    /*-----------------------------------------------------------
    |||||||||||||||||||||||| DELETE |||||||||||||||||||||||||||||
    -----------------------------------------------------------*/
    app.delete('/deleteAllComp', function (req, res){
        Competitor.deleteMany({}, function(err) {
                if (err) {
                    console.log(err)
                } else {
                    console.log('success');
                    res.redirect('/competitors');
                }
            }
        );
    });

    app.post('/deleteitem', function (req, res){
        Item.deleteOne({id: req.body.id}, function(err) {
                if (err) {
                    console.log(err)
                } else {
                    console.log('success');
                    res.redirect('/items');
                }
            }
        );
    });

    app.post('/deletecompetitor', function (req, res){
        Url.deleteMany({competitor: req.body._id}, function(err) {
                if (err) {
                    console.log(err)
                } else {
                    console.log('success');
                    //res.redirect('/competitors');
                }
            }
        );
        Competitor.deleteOne({_id: req.body._id}, function(err) {
            if (err) {
                console.log(err)
            } else {
                console.log('success');
                res.redirect('/competitors');
            }
        });
    });

    app.delete('/deleteAllItems', function (req, res){
        Item.deleteMany({}, function(err) {
                if (err) {
                    console.log(err)
                } else {
                    console.log('success');
                    res.redirect('/items');
                }
            }
        );
    });
}

function startServer(port) {

    mongoose.connect('mongodb://localhost/Companies', {useNewUrlParser: true}).then(
        () => {
            console.log("Connected to DB!");
        },
        err => {
            console.error('connection	error:', err.message)
        }
    );

    /*
    let db = mongoose.connection;

    db.on('error', function (err) {
        console.log('connection	error:', err.message);
    });
    db.once('open',	function callback () {
        console.log("Connected to DB!");
    });*/

    let app = express();

    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(bodyParser.json());

    app.set('views', path.join(__dirname, 'views'));
    app.set('view engine', 'ejs');

    app.use(morgan('dev'));

    configureEndpoints(app);

    app.listen(port, function () {
        console.log('My Application Running on http://localhost:'+port+'/');
    });
}

exports.startServer = startServer;