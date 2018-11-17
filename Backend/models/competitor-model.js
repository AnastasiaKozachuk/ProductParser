const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let CompetitorsSchema = new Schema({
    _id: {type: Schema.Types.ObjectId},
    comp_name: {type: String, required: false, trim: true},
    site: {type: String, required: false, trim: true},
    active: {type: Boolean, required: false, default: true}
});

let Competitors = mongoose.model('Competitors', CompetitorsSchema);


// Export the model
module.exports = {
    competitorSchema: function() { return CompetitorsSchema;},
    competitor_model: Competitors
};