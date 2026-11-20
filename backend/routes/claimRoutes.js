const express = require('express');
const router = express.Router();

const User = require('../models/User');
const Item = require('../models/Item');

const Claim = require('../models/Claim');

const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

// 1. SUBMIT A CLAIM
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { itemId, description } = req.body;

        // Check required fields
        if (!itemId || !description) {
            return res.status(400).json({
                message: 'Item ID and description are required'
            });
        }

        // Check whether item ID is valid
        if (!require('mongoose').isValidObjectId(itemId)) {
            return res.status(400).json({
                message: 'Invalid item ID'
            });
        }

        // Find the item
        const item = await Item.findById(itemId);

        if (!item) {
            return res.status(404).json({
                message: 'Item not found'
            });
        }

        // Only found items can be claimed
        if (item.listingType !== 'found') {
            return res.status(400).json({
                message: 'Only found items can be claimed'
            });
        }

        // Prevent students from claiming their own items
        if (item.user.toString() === req.user.id) {
            return res.status(403).json({
                message: 'You cannot claim your own item'
            });
        }

        // Check whether item is still available
        if (item.status !== 'active') {
            return res.status(400).json({
                message: 'This item is no longer available'
            });
        }

        // Check for an existing pending claim
        const existingClaim = await Claim.findOne({
            item: itemId,
            claimant: req.user.id,
            status: 'pending'
        });

        if (existingClaim) {
            return res.status(400).json({
                message: 'You have already submitted a claim for this item'
            });
        }

        // Create a new claim
        const newClaim = new Claim({
            item: itemId,
            claimant: req.user.id,
            description
        });

        await newClaim.save();

        res.status(201).json({
            message: 'Claim submitted successfully!',
            claim: newClaim
        });

    } catch (error) {
        res.status(500).json({
            message: 'Failed to submit claim',
            error: error.message
        });
    }
});

// GET: Admin Dashboard Statistics
router.get('/stats', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const [
            totalStudents,
            totalItems,
            totalLostItems,
            totalFoundItems,
            pendingClaims,
            approvedClaims,
            rejectedClaims
        ] = await Promise.all([
            User.countDocuments({ role: 'user' }),
            Item.countDocuments(),
            Item.countDocuments({ listingType: 'lost' }),
            Item.countDocuments({ listingType: 'found' }),
            Claim.countDocuments({ status: 'pending' }),
            Claim.countDocuments({ status: 'approved' }),
            Claim.countDocuments({ status: 'rejected' })
        ]);

        res.status(200).json({
            message: 'Dashboard statistics fetched successfully!',
            statistics: {
                totalStudents,
                totalItems,
                totalLostItems,
                totalFoundItems,
                pendingClaims,
                approvedClaims,
                rejectedClaims
            }
        });

    } catch (error) {
        res.status(500).json({
            message: 'Error fetching dashboard statistics',
            error: error.message
        });
    }
});

// ADMIN: VIEW ALL CLAIMS
router.get('/', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const claims = await Claim.find()
            .populate('item')
            .populate('claimant', 'name email')
            .sort({ createdAt: -1 });

        res.status(200).json({
            count: claims.length,
            claims
        });

    } catch (error) {
        res.status(500).json({
            message: 'Failed to fetch claims',
            error: error.message
        });
    }
});

// GET: View claims submitted by the logged-in student
router.get('/my-claims', authMiddleware, async (req, res) => {
    try {
        const claims = await Claim.find({
            claimant: req.user.id
        })
            .populate('item')
            .sort({ createdAt: -1 });

        res.status(200).json({
            message: 'Your claims fetched successfully!',
            count: claims.length,
            claims: claims
        });

    } catch (error) {
        res.status(500).json({
            message: 'Error fetching your claims',
            error: error.message
        });
    }
});

// ADMIN: APPROVE A CLAIM
router.put('/:id/approve', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const claim = await Claim.findById(req.params.id);

        if (!claim) {
            return res.status(404).json({
                message: 'Claim not found'
            });
        }

        if (claim.status !== 'pending') {
            return res.status(400).json({
                message: 'This claim has already been reviewed'
            });
        }

        claim.status = 'approved';
        await claim.save();

        await Item.findByIdAndUpdate(claim.item, {
            status: 'returned'
        });

        res.status(200).json({
            message: 'Claim approved successfully!',
            claim
        });

    } catch (error) {
        res.status(500).json({
            message: 'Failed to approve claim',
            error: error.message
        });
    }
});

// ADMIN: REJECT A CLAIM
router.put('/:id/reject', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const claim = await Claim.findById(req.params.id);

        if (!claim) {
            return res.status(404).json({
                message: 'Claim not found'
            });
        }

        if (claim.status !== 'pending') {
            return res.status(400).json({
                message: 'This claim has already been reviewed'
            });
        }

        claim.status = 'rejected';
        await claim.save();

        res.status(200).json({
            message: 'Claim rejected successfully!',
            claim
        });

    } catch (error) {
        res.status(500).json({
            message: 'Failed to reject claim',
            error: error.message
        });
    }
});

module.exports = router;