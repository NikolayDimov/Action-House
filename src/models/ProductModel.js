const { Schema, model, Types: { ObjectId } } = require('mongoose');

const URL_PATTERN = /^https?:\/\/(.+)/;


// TODO add validation
const productSchema = new Schema({
    title: { type: String, required: [true, 'Title is required'], minlength: [4, 'Title must be at least 4 characters long'] },
    description: { type: String, required: [true, 'Description is required'], maxlength: [200, 'Description must be at most 200 characters long']},
    category: { type: String, required: [true, 'Category is required'] },
    image: {
        type: String, required: true, validate: {
            validator(value) {
                return URL_PATTERN.test(value);
            },
            message: 'Image must be a valid URL'
        }
    },
    price: { type: Number, required: true, min: 0, default: 0},
    bidder: { type: ObjectId, ref: 'User' },
    closed: { type: Boolean, default: false },
    owner: { type: ObjectId, ref: 'User', required: true }
});


const ProductModel = model('Product', productSchema);

module.exports = ProductModel;