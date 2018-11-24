let express = require('express');
let path = require('path');
let morgan = require('morgan');
let bodyParser = require('body-parser');
let favicon = require('serve-favicon');
let mongoose = require('mongoose');

let competitor_routes = require('./routes/competitor-routes');
let parser_routes = require('./routes/parser-routes');
let item_routes = require('./routes/item-routes');
let analysis_routes = require('./routes/analysis-routes');

function configureEndpoints(app) {

    /*-----------------------------------------------------------
    ||||||||||||||||||||||||||| USE |||||||||||||||||||||||||||||
    -----------------------------------------------------------*/

    app.use(express.static(path.join(__dirname, '../Frontend/www')));
    app.use(favicon(path.join(__dirname, '../Frontend/www/assets/images/favicon.ico')));

    /*-----------------------------------------------------------
    ||||||||||||||||||||||||||| GET |||||||||||||||||||||||||||||
    -----------------------------------------------------------*/
    app.get('/', function (req, res) {
        res.render('homePage', {
            pageTitle: 'Welcome'
        });
    });
}

function startServer(port) {

    mongoose.connect('mongodb://localhost/Companies', { useNewUrlParser: true }).then(
        () => {
            console.log("Connected to DB!");
        },
        err => {
            console.error('connection	error:', err.message)
        }
    );


    let app = express();

    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(bodyParser.json());

    app.set('views', path.join(__dirname, 'views'));
    app.set('view engine', 'ejs');

    app.use(morgan('dev'));

    configureEndpoints(app);
    item_routes.configureEndpointsItem(app);
    competitor_routes.configureEndpointsComp(app);
    parser_routes.configureEndpointsParser(app);
    analysis_routes.configureEndpointsAnalysis(app);

    app.listen(port, function () {
        console.log('My Application Running on http://localhost:' + port + '/');
    });
}

exports.startServer = startServer;