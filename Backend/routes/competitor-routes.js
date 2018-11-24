let mongoose = require('mongoose');

const Url_Model = require('../models/urls-model');
const Competitor_Model = require('../models/competitor-model');
const Item_Model = require('../models/item-model');

const Url = Url_Model.url_model;
const Competitor = Competitor_Model.competitor_model;
const Item = Item_Model.item_model;

function configureEndpointsComp(app) {

    /*-----------------------------------------------------------
    ||||||||||||||||||||||||||| GET |||||||||||||||||||||||||||||
    -----------------------------------------------------------*/
    app.get('/competitors', async function (req, res) {
        //window.location.reload();
        let items_doc = await Item.find({});
        Competitor.find({}, function (err, results) {
            res.render('competitorsPage', {
                pageTitle: 'My Competitors',
                competitors: results,
                items: items_doc
            });
        });
    });

    /*-----------------------------------------------------------
    |||||||||||||||||||||||||| POST |||||||||||||||||||||||||||||
    -----------------------------------------------------------*/

    app.post('/addcompitemurl', async function(req, res){
        let item = await Item.findOne({ id: req.body.id });
        let comp = await Competitor.findOne({ site: req.body.site });
        Url.findOne({url: req.body.url}, function(err, urls){
            if ( urls === null || isEmptyObject(urls)) {
                let newUrl = Url({
                    item: item._id,
                    competitor: comp._id,
                    url: urls.url,
                    active: item.active
                });
                // save the Url
                newUrl.save(function (err) {
                    if (err) throw err;
                    console.log('Url created!');
                });
            }
        });
        res.redirect('/competitors');
    });

    app.post('/competitors/data', async function (req, res) {
        const keys = Object.keys((req.body)[0]);
        let my_competitors = [];
        for (let i = 3; i < keys.length; i++) {
            //get the site
            const site_name = keys[i].trim();
            if (!my_competitors.includes(site_name)) {
                my_competitors.push(site_name);
            }
        }
        for (let competitor of my_competitors) {
            let result = await Competitor.findOne({ site: competitor });
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

        for (let url of req.body) {
            if (!isEmptyObject(url)) {
                let item = await Item.findOne({ id: url[keys[0]] });
                for (let i = 3; i < keys.length; i++) {
                    let comp = await Competitor.findOne({ site: keys[i] });
                    const comp_url = url[keys[i]];
                    let found_url = await Url.find({ url: comp_url });
                    if (found_url === null || isEmptyObject(found_url)) {
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

    app.post('/urls', async function (req, res) {
        let all_items = await Item.find({});
        let results = [];
        for (let i of all_items) {
            let u = {};
            u.id = i.id;
            u.name = i.name;
            u.vendorCode = i.vendorCode;

            let urls_comp = await Url.findOne({ competitor: req.body._id, item: i._id });
            if (urls_comp === null || isEmptyObject(urls_comp)) {
                u.url = "";
                u.active = i.active;
            } else {
                u.url = urls_comp.url;
                u.active = urls_comp.active;
            }
            u.active_item = i.active;
            console.log(u);
            results.push(u);

        }
        res.send(results);
    });

    app.post('/addcompetitor', function (req, res) {
        console.log("/competitor/create SUCCESS");
        if (req.body.site !== "" || req.body.site !== undefined) {
            Competitor.find({ site: req.body.site }, function (err, docs) {
                if (!Array.isArray(docs) || !docs.length) {
                    let newCompetitor = Competitor({
                        _id: new mongoose.Types.ObjectId(),
                        comp_name: (req.body.comp_name !== "" || req.body.comp_name !== undefined) ? req.body.comp_name : req.body.site,
                        site: req.body.site
                    });
                    // save the user
                    newCompetitor.save(function (err) {
                        if (err) throw err;
                        console.log('Competitor created!');
                    });
                }
            });
        }
        res.redirect('/competitors');
    });

    app.post('/editUrlCompetitor', function (req, res) {
        console.log(req.body.url);
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
        res.redirect('/competitors');
    });

    app.post('/editcompetitor', function (req, res) {
        console.log(req.body.site);
        Competitor.updateOne(
            { site: req.body.site },
            {
                $set:
                    {
                        comp_name: req.body.comp_name,
                        site: req.body.site
                    }
            }, function (err, res) {
                if (err) throw err;
                console.log("1 document updated");
                console.log(res);
            }
        );
        res.redirect('/competitors');
    });

    app.post('/active-disable-url', function (req, res) {
        let value_bool = (req.body.active !== 'true');

        Url.updateOne(
            { url: req.body.url },
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
        res.redirect('/competitors');
    });

    /*-----------------------------------------------------------
    |||||||||||||||||||||||| DELETE |||||||||||||||||||||||||||||
    -----------------------------------------------------------*/
    app.delete('/deleteAllComp', function (req, res) {
        Competitor.deleteMany({}, function (err) {
                if (err) {
                    console.log(err)
                } else {
                    console.log('success');
                    res.redirect('/competitors');
                }
            }
        );
    });

    app.post('/deletecompetitor', function (req, res) {
        Url.deleteMany({ competitor: req.body._id }, function (err) {
                if (err) {
                    console.log(err)
                } else {
                    console.log('success');
                    //res.redirect('/competitors');
                }
            }
        );
        Competitor.deleteOne({ _id: req.body._id }, function (err) {
            if (err) {
                console.log(err)
            } else {
                console.log('success');
                res.redirect('/competitors');
            }
        });
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

exports.configureEndpointsComp = configureEndpointsComp;