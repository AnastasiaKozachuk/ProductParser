const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let ProductSchema = new Schema({
    id: {type: String, required: false, trim: true},
    vendorCode:	{type: String, required: false, trim: true},
    name: {type: String, required: false, trim: true},
    brand: {type: String, required: false, trim: true},
    price: {type: String, required: false, trim: true},
    active: {type: Boolean, required: false, default: true}
});

// Export the model
module.exports = mongoose.model('Product', ProductSchema);