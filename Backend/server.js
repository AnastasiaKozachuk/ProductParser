let express = require('express');
let path = require('path');
let morgan = require('morgan');
let bodyParser = require('body-parser');
let favicon = require('serve-favicon');
let mongoose = require('mongoose');
//let pages = require('./pages');
let util = require('util');
let Window = require('window');

let window = new Window();
const Competitor = require('./models/competitor-model');
const Item = require('./models/item-model');

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
        window.location.reload();
        Item.find({}, function (err, docs) {
            console.log(docs);
            res.render('homePage', {
                pageTitle: 'My Items',
                items: docs
            });
        });
    });
    app.get('/competitors', function (req, res){
        let docs_competitors = [];
        let docs_items = [];
        Competitor.find({}, function (err, docs) {
            console.log(docs);
            docs_competitors = docs;
        });
        Item.find({}, function (err, docs) {
            console.log(docs);
            docs_items = docs;
        });
        res.render('competitorsPage', {
            pageTitle: 'My Competitors',
            competitors: docs_competitors,
            items: docs_items
        });
    });
    app.get('/items', function (req, res){
        window.location.reload();
        Item.find({}, function (err, docs) {
            console.log(docs);
            res.render('homePage', {
                pageTitle: 'My Items',
                items: docs
            });
        });
    });

    /*-----------------------------------------------------------
    |||||||||||||||||||||||||| POST |||||||||||||||||||||||||||||
    -----------------------------------------------------------*/

    app.post('/item', function (req, res){
        Item.find({id: req.body.id}, function (err, docs) {
            console.log(docs);
            res.render('viewItemPage', {
                pageTitle: 'My Item',
                items: docs
            });
        });
    });


    app.post('/competitors/data', function (req, res){
        console.log("Request: " + util.inspect(req.body, false, null));
        // create


        //console.log("Request: " + req.body[0]["ID"]);
        res.redirect('/competitors');
    });

    app.post('/items/data', function (req, res){
        console.log("Request: " + util.inspect(req.body, false, null));
        (req.body).forEach(item => {
            if(!isEmptyObject(item)){
                Item.find({id: item["ID"]}, function (err, docs) {
                    if (!Array.isArray(docs) || !docs.length){
                        let newItem = Item({
                            id: item["ID"],
                            vendorCode: item["Артикул"],
                            name: item["Назва"],
                            brand: item["Бренд"],
                            price: item["Ціна"]
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

        //console.log("Request: " + req.body[0]["ID"]);
        res.redirect('/items');
    });

    app.post('/additem', function (req, res){
        console.log("/item/create SUCCESS");
            if(req.body.id !== "" || req.body.id !== undefined){
                Item.find({id: req.body.id}, function (err, docs) {
                    if (!Array.isArray(docs) || !docs.length){
                        let newItem = Item({
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

    app.post('/competitors/create', function (req, res){
        console.log("/competitors/create SUCCESS");
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
    mongoose.connect('mongodb://localhost/Companies', { useNewUrlParser: true });
    let db = mongoose.connection;

    db.on('error', function (err) {
        console.log('connection	error:', err.message);
    });
    db.once('open',	function callback () {
        console.log("Connected to DB!");
    });

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