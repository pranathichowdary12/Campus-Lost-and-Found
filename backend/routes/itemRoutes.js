const express = require('express');
const router = express.Router();

const Item = require('../models/Item');
const authMiddleware = require('../middleware/authMiddleware');

// 1. REPORT A LOST OR FOUND ITEM
router.post('/', authMiddleware, async (req, res) => {
    try {
        const {
            itemName,
            category,
            description,
            location,
            date,
            listingType,
            image
        } = req.body;

        if (!itemName || !category || !description ||
            !location || !date || !listingType) {
            return res.status(400).json({
                message: 'Please fill in all required fields'
            });
        }

        if (!['lost', 'found'].includes(listingType)) {
            return res.status(400).json({
                message: 'Listing type must be lost or found'
            });
        }

        const newItem = new Item({
            itemName,
            category,
            description,
            location,
            date,
            listingType,
            image: image || '',
            user: req.user.id
        });

        await newItem.save();

        res.status(201).json({
            message: 'Item reported successfully!',
            item: newItem
        });

    } catch (error) {
        res.status(500).json({
            message: 'Failed to report item',
            error: error.message
        });
    }
});

// GET: View items reported by the logged-in student
router.get('/my-items', authMiddleware, async (req, res) => {
    try {
        const items = await Item.find({
            user: req.user.id
        }).sort({ createdAt: -1 });

        res.status(200).json({
            message: 'Your reported items fetched successfully!',
            count: items.length,
            items: items
        });

    } catch (error) {
        res.status(500).json({
            message: 'Error fetching your items',
            error: error.message
        });
    }
});

// 2. GET ALL LOST AND FOUND ITEMS
router.get('/', async (req, res) => {
    try {
        const { search, category, location, listingType } = req.query;

        const filter = {};

        if (search) {
            filter.itemName = {
                $regex: search,
                $options: 'i'
            };
        }

        if (category) {
            filter.category = category;
        }

        if (location) {
            filter.location = {
                $regex: location,
                $options: 'i'
            };
        }

        if (listingType) {
            filter.listingType = listingType;
        }

        const items = await Item.find(filter)
            .populate('user', 'name email')
            .sort({ createdAt: -1 });

        res.status(200).json({
            count: items.length,
            items
        });

    } catch (error) {
        res.status(500).json({
            message: 'Failed to fetch items',
            error: error.message
        });
    }
});

module.exports = router;