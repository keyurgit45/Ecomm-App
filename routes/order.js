const express = require('express')
const { createOrder , getOrder, getLoggedInOrders, adminGetOrders, adminUpdateOrder, adminDeleteOrder} = require('../controller/orderController')
const { isLoggedIn, customRole } = require('../middleware/user')

const router = express.Router()

router.route("/order/create").post(isLoggedIn, createOrder)
router.route("/order/:id").get(isLoggedIn, getOrder)
router.route("/myorders").get(isLoggedIn, getLoggedInOrders)

//admin routes
router.route("/admin/orders").get(isLoggedIn, customRole('admin'), adminGetOrders)
router.route("/admin/order/:id").put(isLoggedIn, customRole('admin'), adminUpdateOrder)
router.route("/admin/order/:id").delete(isLoggedIn, customRole('admin'), adminDeleteOrder)

module.exports = router