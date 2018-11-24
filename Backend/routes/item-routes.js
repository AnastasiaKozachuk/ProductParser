let mongoose = require('mongoose');
let util = require('util');
let Window = require('window');

const Url_Model = require('../models/urls-model');
const Competitor_Model = require('../models/competitor-model');
const Item_Model = require('../models/item-model');

let window = new Window();
const Url = Url_Model.url_model;
const Competitor = Competitor_Model.competitor_model;
const Item = Item_Model.item_model;

function configureEndpointsItem(app) {

    /*-----------------------------------------------------------
    ||||||||||||||||||||||||||| GET |||||||||||||||||||||||||||||
    -----------------------------------------------------------*/

    app.get('/items', function (req, res) {
        window.location.reload();
        Item.find({}, function (err, docs) {
            console.log(docs);
            res.render('itemPage', {
                pageTitle: 'My Items',
                items: docs
            });
        });
    });

    /*-----------------------------------------------------------
    |||||||||||||||||||||||||| POST |||||||||||||||||||||||||||||
    -----------------------------------------------------------*/
    app.post('/active-disable', function (req, res) {
        let value_bool = (req.body.active !== 'true');

        Item.updateOne(
            { id: req.body.id },
            {
                $set:
                    {
                        active: value_bool
                    }
            }, function (err, res) {
                if (err) throw err;
                console.log("1 document updated");
                console.log(res);
            }
        );
        res.redirect('/items');
    });
    app.post('/item', async function (req, res) {
        let item_info = await Item.findOne({ _id: req.body._id });
        let all_competitors = await Competitor.find({});
        let results = [];
        for (let i of all_competitors) {
            let u = {};
            u.comp_name = i.comp_name;
            u.site = i.site;

            let urls_item = await Url.findOne({ item: req.body._id, competitor: i._id });
            if (urls_item === null || isEmptyObject(urls_item)) {
                u.url = "";
            } else {
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

    app.post('/items/data', function (req, res) {
        console.log("Request: " + util.inspect(req.body, false, null));
        const keys = Object.keys((req.body)[0]);
        (req.body).forEach(item => {
            if (!isEmptyObject(item)) {
                Item.find({ id: item[keys[0]] }, function (err, docs) {
                    if (!Array.isArray(docs) || !docs.length) {
                        let newItem = Item({
                            _id: new mongoose.Types.ObjectId(),
                            id: item[keys[0]],
                            vendorCode: item[keys[1]],
                            name: item[keys[2]],
                            brand: item[keys[3]],
                            price: item[keys[4]]
                        });
                        // save the user
                        newItem.save(function (err) {
                            if (err) throw err;
                            console.log('Item created!');
                        });
                    }
                });
            }
        });
        res.redirect('/items');
    });

    app.post('/additem', function (req, res) {
        console.log("/item/create SUCCESS");
        if (req.body.id !== "" || req.body.id !== undefined) {
            Item.find({ id: req.body.id }, function (err, docs) {
                if (!Array.isArray(docs) || !docs.length) {
                    let newItem = Item({
                        _id: new mongoose.Types.ObjectId(),
                        id: req.body.id,
                        vendorCode: req.body.vendorCode,
                        name: req.body.name,
                        brand: req.body.brand,
                        price: req.body.price
                    });
                    // save the user
                    newItem.save(function (err) {
                        if (err) throw err;
                        console.log('Item created!');
                    });
                }
            });
        }
        res.redirect('/items');
    });

    app.post('/edititem', function (req, res) {
        console.log(req.body.id);
        Item.updateOne(
            { id: req.body.id },
            {
                $set:
                    {
                        name: req.body.name,
                        brand: req.body.brand,
                        price: req.body.price
                    }
            }, function (err, res) {
                if (err) throw err;
                console.log("1 document updated");
                console.log(res);
            }
        );
        res.redirect('/items');
    });

    app.post('/editUrlItem', function (req, res) {
        console.log(req.body.id);
        Url.updateOne(
            { url: req.body.url },
            {
                $set:
                    {
                        url: req.body.url
                    }
            }, function (err, res) {
                if (err) throw err;
                console.log("1 document updated");
                console.log(res);
            }
        );
        res.redirect('/item, req.body.id');
    });

    /*-----------------------------------------------------------
    |||||||||||||||||||||||| DELETE |||||||||||||||||||||||||||||
    -----------------------------------------------------------*/

    app.post('/deleteitem', function (req, res) {
        Item.deleteOne({ id: req.body.id }, function (err) {
                if (err) {
                    console.log(err)
                } else {
                    console.log('success');
                    res.redirect('/items');
                }
            }
        );
    });

    app.delete('/deleteAllItems', function (req, res) {
        Item.deleteMany({}, function (err) {
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

function isEmptyObject(obj) {
    for (let key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            return false;
        }
    }
    return true;
}

exports.configureEndpointsItem = configureEndpointsItem;