const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({

    itemName: {
        type: String,
        required: true,
        trim: true
    },

    category: {
        type: String,
        required: true
    },

    description: {
        type: String,
        required: true
    },

    location: {
        type: String,
        required: true
    },

    date: {
        type: Date,
        required: true
    },

    listingType: {
        type: String,
        enum: ['lost', 'found'],
        required: true
    },

    image: {
        type: String,
        default: ''
    },

    status: {
        type: String,
        enum: ['active', 'claimed', 'returned'],
        default: 'active'
    },

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }

}, { timestamps: true });

module.exports = mongoose.model('Item', itemSchema);