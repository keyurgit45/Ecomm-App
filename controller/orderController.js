const BigPromise = require('../middleware/bigPromise')
const Order = require('../models/order')
const Product = require('../models/product')

exports.createOrder = BigPromise(async (req, res, next) => {
    const {
        shippingInfo,
        orderItems,
        paymentInfo,
        taxAmount,
        shippingAmount,
        totalAmount,
    } = req.body

    if (
        !shippingInfo ||
        !orderItems ||
        !paymentInfo ||
        !taxAmount ||
        !shippingAmount |
        !totalAmount
    ) return next(new Error('All fields are not comming in!'))
    const order = await Order.create({
        shippingInfo,
        orderItems,
        paymentInfo,
        taxAmount,
        shippingAmount,
        totalAmount,
        user: req.user._id
    })

    res.status(200).json({
        success: true,
        order
    })
})

exports.getOrder = BigPromise(async (req, res, next) => {
    const order = await Order.findById(req.params.id).populate('user', 'name email')

    if (!order) return next(new Error("Couldn't get the order"))

    res.status(200).json({
        success: 200,
        order
    })
})

exports.getLoggedInOrders = BigPromise(async (req, res, next) => {
    const order = await Order.find({ user: req.user._id })

    if (!order) return next(new Error("Couldn't get the order"))

    res.status(200).json({
        success: 200,
        order
    })
})

exports.adminGetOrders = BigPromise(async (req, res, next) => {
    const orders = await Order.find()

    if (!orders) return next(new Error("Couldn't get the order"))

    res.status(200).json({
        success: 200,
        orders
    })
})

exports.adminUpdateOrder = BigPromise(async (req, res, next) => {
    const order = await Order.findById(req.params.id)

    const orderStatus = req.body.orderStatus

    if (order.orderStatus === 'delivered') {
        return next(new Error('Order is already marked for Delivered'))
    }


    order.orderStatus = orderStatus

    if (orderStatus === 'delivered') {
        order.orderItems.forEach(async (prod) => {
            await updateProductStock(prod.product, prod.quantity)
        });
    }

    await order.save();

    if (!order) return next(new Error("Couldn't get the order"))

    res.status(200).json({
        success: 200,
        order
    })
})

exports.adminDeleteOrder = BigPromise(async (req, res, next) => {
    const order = await Order.findById(req.params.id)

    if (!order) return next(new Error("Couldn't get the order"))

    await order.remove();

    res.status(200).json({
        success: 200,
        message: "Order deleted!"
    })
})


async function updateProductStock(productId, quantity) {
    const product = await Product.findById(productId)

    product.stock = product.stock - quantity

    await product.save({ validateBeforeSave: false })
}