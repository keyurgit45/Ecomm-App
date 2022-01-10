const mongoose = require("mongoose")

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a product name'],
        trim: true,
        max: [100, 'Product name should not be more than 100 chars']
    },
    price: {
        type: Number,
        required: [true, 'Please provide a product price'],
    },
    description: {
        type: String,
        required: [true, 'Please provide a product description'],
        trim: true,
    },
    photos: [
        {
            id: {
                type: String,
                required: true
            },
            secure_url: {
                type: String,
                required: true
            }
        }
    ],
    category: {
        type: String,
        required: [true, 'Please provide a product category'],
        trim: true,
        enum: {
            values: ['shortsleeves', 'longsleeves', 'sweatshirt', 'hoodies'],
            message: 'Please select a valid category'
        }
    },
    stock:{
        type: Number,
        required: true
    },
    brand: {
        type: String,
        required: [true, "Please add a brand"]
    },
    ratings: {
        type: Number,
        default: 0
    },
    numberOfReviews: {
        type: Number,
        default: 0
    },
    reviews: [{
        user:  {
            type: mongoose.Schema.ObjectId,
            ref: 'User',
            required: true
        },
        name: {
            type: String,
            required: true
        },
        rating: {
            type: Number,
            required: true
        },
        comment: {
            type: String,
            required: true
        }
    }],
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }

})

module.exports = mongoose.model('Product', productSchema)