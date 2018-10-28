const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let CompetitorsSchema = new Schema({
    id: {type: String, required: false, trim: true},
    vendorCode:	{type: String, required: false, trim: true},
    name: {type: String, required: false, trim: true},
    comp_name: {type: String, required: false, trim: true},
    site: {type: String, required: false, trim: true},
    url: {type: String, required: false, trim: true},
    active: {type: Boolean, required: false, default: true}
});

// Export the model
module.exports = mongoose.model('Competitors', CompetitorsSchema);