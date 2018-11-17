const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let ProductSchema = new Schema({
    _id: {type: Schema.Types.ObjectId},
    id: {type: String, required: false, trim: true},
    vendorCode:	{type: String, required: false, trim: true},
    name: {type: String, required: false, trim: true},
    brand: {type: String, required: false, trim: true},
    price: {type: String, required: false, trim: true},
    active: {type: Boolean, required: false, default: true}
});
let Product = mongoose.model('Product', ProductSchema);

module.exports = {
    itemSchema: function() { return ProductSchema;},
    item_model: Product
};