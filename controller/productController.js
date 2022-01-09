const BigPromise = require('../middleware/bigPromise')
const Product = require('../models/product')
const cloudinary = require('cloudinary')
const fileUpload = require('express-fileupload')
const WhereClause = require('../utils/whereClause')

exports.addProduct = BigPromise(async (req, res, next) => {
    //images
    let imageArray = []
    if (!req.body.name || !req.body.price || !req.body.description || !req.body.category || !req.body.brand) {
        return next(new Error('Product name, price, description, category and brand are required!'))
    }

    if (!req.files) return next(new Error('Product Images are required!')) //!check for multiple images

    if (req.files) {
        for (let index = 0; index < req.files.photos.length; index++) {
            let result = await cloudinary.v2.uploader.upload(req.files.photos[index].tempFilePath, {
                folder: 'products',
            })
            imageArray.push({
                id: result.public_id,
                secure_url: result.secure_url
            })
        }
    }

    req.body.photos = imageArray
    req.body.user = req.user.id
    req.body.price = parseInt(req.body.price)

    const product = await Product.create(req.body)
    res.status(200).json({
        success: true,
        product
    })

})

exports.getProducts = BigPromise(async (req, res, next) => {

    const resultPerPage = 6
    // const productCount = await Product.countDocuments()

    const productsObj = new WhereClause(Product.find(), req.query).search().filter()

    let products = await productsObj.base
    const productCount = products.length

    productsObj.pager(resultPerPage)
    products = await productsObj.base.clone()

    res.status(200).json({
        success: true,
        productCount,
        products
    })
})

exports.getOneProduct = BigPromise(async (req, res, next) => {

    const product = await Product.findById(req.params.id)

    if (!product) return next(new Error("No Product Found with this id"))

    res.status(200).json({
        success: true,
        product
    })
})

exports.addReview = BigPromise(async (req, res, next) => {
    const { rating, comment, productId } = req.body

    const review = {
        user: req.user._id,
        name: req.user.name,
        rating: Number.parseInt(rating),
        comment
    }

    const product = await Product.findById(productId)

    const alreadyReviewed = product.reviews.find((rev) => rev.user.toString() === req.user._id.toString())

    if (alreadyReviewed) {
        product.reviews.array.forEach(rev => {
            if (rev.user.toString() === req.user._id.toString()) {
                rev.comment = comment;
                rev.rating = rating;
            }
        });
    } else {
        product.reviews.push(review)
        product.numberOfReviews = product.reviews.length
    }

    product.ratings = product.reviews.reduce((acc, item) =>
        item.rating + acc, 0
    ) / product.reviews.length

    await product.save({validateBeforeSave: false})
    res.status(200).json({
        success: true,
        reviews: product.reviews
    })
})

exports.deleteReview = BigPromise(async (req, res, next) => {
    const { productId } = req.body

    const product = await Product.findById(productId)
    
    const reviews = product.reviews.filter((rev) => rev.user.toString() === req.user._id.toString())

    const numberOfReviews = reviews.length

    ratings = reviews.reduce((acc, item) =>
        item.rating + acc, 0
    ) / reviews.length

    await Product.findByIdAndUpdate(productId, {reviews, ratings, numberOfReviews},{new: true, runValidators: true})

    res.status(200).json({
        success: true,
        message: "review deleted"
    })
})

exports.getReviews = BigPromise(async (req, res, next) => {

    if(!req.query.productId) return next(new Error("Product Id is required!"))

    const productId = req.query.productId

    const product = await Product.findById(productId)

    res.status(200).json({
        success: true,
        reviews: product.reviews
    })
})


//* admin routes
exports.adminGetProducts = BigPromise(async (req, res, next) => {

    const products = await Product.find()
    let productCount = 0
    if (products) {
        productCount = products.length
    }
    res.status(200).json({
        success: true,
        productCount,
        products
    })
})

exports.adminUpdateOneProduct = BigPromise(async (req, res, next) => {

    const product = await Product.findById(req.params.id)

    if (!product) return next(new Error("No Product Found with this id"))
    // if(!req.files) return next( new Error("Product images are reuired!"))
    let imageArray = []
    if (req.files) {
        //destroy existing images
        for (let index = 0; index < product.photos.length; index++) {
            let result = await cloudinary.v2.uploader.destroy(product.photos[index].id)
        }
        //upload new images
        for (let index = 0; index < req.files.photos.length; index++) {
            let result = await cloudinary.v2.uploader.upload(req.files.photos[index].tempFilePath, {
                folder: 'products',
            })
            imageArray.push({
                id: result.public_id,
                secure_url: result.secure_url
            })
        }
    }

    req.body.photos = imageArray //!what if no photoes are sent 
    req.body.user = req.user.id
    req.body.price = parseInt(req.body.price)

    const newproduct = await Product.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
        useFindAndModify: false
    })
    res.status(200).json({
        success: true,
        newproduct
    })

})

exports.adminDeleteOneProduct = BigPromise(async (req, res, next) => {

    const product = await Product.findById(req.params.id)

    if (!product) return next(new Error("No Product Found with this id"))

    //destroy existing images
    for (let index = 0; index < product.photos.length; index++) {
        let result = await cloudinary.v2.uploader.destroy(product.photos[index].id)
    }

    await product.remove()

    res.status(200).json({
        success: true,
        message: "Deleted Successfully"
    })

})

