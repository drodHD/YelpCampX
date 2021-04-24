const express = require('express');
const router = express.Router({ mergeParams: true }); //merge params from campgrounds with reviews

const catchAsync = require('../Utils/catchAsync');
const ExpressError = require('../Utils/ExpressError');

const Review = require('../models/review');
const Campground = require('../models/campground');

const reviews = require('../controllers/reviews');


const { validateReview, isLoggedIn , isReviewAuthor} = require('../middleware')


router.post('/', validateReview, isLoggedIn, catchAsync(reviews.createReview));
//delete a review
router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview));

module.exports = router;