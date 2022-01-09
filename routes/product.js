const express = require('express')
const router = express.Router()

const { addProduct, getProducts, adminGetProducts, getOneProduct, adminUpdateOneProduct, adminDeleteOneProduct, addReview, deleteReview, getReviews } = require('../controller/productController')
const { isLoggedIn, customRole } = require('../middleware/user')

//user routes
router.route('/products').get(isLoggedIn, getProducts)
router.route('/product/:id').get(isLoggedIn, getOneProduct)

router.route('/review').put(isLoggedIn, addReview)
router.route('/review').delete(isLoggedIn, deleteReview)
router.route('/reviews').get(isLoggedIn, getReviews)

//admin routes
router.route('/admin/products').get(isLoggedIn, customRole('admin'), adminGetProducts)
router.route('/admin/product/add').post(isLoggedIn, customRole('admin'), addProduct)
router.route('/admin/product/:id')
    .put(isLoggedIn, customRole('admin'), adminUpdateOneProduct)
    .delete(isLoggedIn, customRole('admin'), adminDeleteOneProduct)

module.exports = router