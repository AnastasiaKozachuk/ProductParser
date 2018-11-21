const mongoose = require('mongoose');
const Url = require('./urls-model');
const Schema = mongoose.Schema;

let AnalysisSchema = new Schema({
     _id: {type: Schema.Types.ObjectId},
	url: {type: Schema.Types.ObjectId, ref: Url.url_model},
    price: {type: String, required: false, trim: true},
    data: {type: String, required: false, trim: true}
});

let Analysis = mongoose.model('Analysis', AnalysisSchema);


// Export the model
module.exports = {
    analysisSchema: function() { return AnalysisSchema;},
    analysis_model: Analysis
};