var express = require('express');
var path = require('path');
var morgan = require('morgan');
var bodyParser = require('body-parser');
var favicon = require('serve-favicon');
var mongoose = require('mongoose');

function configureEndpoints(app) {
    var pages = require('./pages');

    app.get('/', pages.homePage);

    app.use(express.static(path.join(__dirname, '../Frontend/www')));
    app.use(favicon(path.join(__dirname, '../Frontend/www/assets/images/favicon.ico')));
}

function startServer(port) {
    mongoose.connect('mongodb://localhost/Companies', { useNewUrlParser: true });
    var db =	mongoose.connection;

    db.on('error',	function	(err)	{
        console.log('connection	error:',	err.message);
    });
    db.once('open',	function	callback	()	{
        console.log("Connected	to	DB!");
    });

    var GoodsSchema =	new	mongoose.Schema({
        id:	Number,
        vendorCode:	Number,
        name: String,
        brand:	String,
        price:	Number
    });

    var CompetitorsSchema =	new	mongoose.Schema({
        id:	Number,
        vendorCode:	Number,
        name: String,
        site: String,
        url:String

    });

    var Goods	=	mongoose.model('Goods',	GoodsSchema);
    var Competitors	=	mongoose.model('Competitors',	CompetitorsSchema);




    var app= express();

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