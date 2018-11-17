const mongoose = require('mongoose');
const Item = require('./item-model');
const Competitor = require('./competitor-model');
const Schema = mongoose.Schema;

/*let UrlsSchema = new Schema({
    competitor: Competitor.competitorSchema(),
    item: Item.itemSchema(),
    url: {type: String, required: false, trim: true}
});*/

let UrlsSchema = new Schema({
    competitor: {type: Schema.Types.ObjectId, ref: Competitor.competitor_model},
    item: {type: Schema.Types.ObjectId, ref: Item.item_model},
    url: {type: String, required: false, trim: true}
});

let Urls = mongoose.model('Urls', UrlsSchema);

module.exports = {
    urlSchema: function() { return UrlsSchema;},
    url_model: Urls
};