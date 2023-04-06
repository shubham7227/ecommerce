const mongoose = require("mongoose");
const orderModel = require("../models/orderModel");
const cartModel = require("../models/cartModel");
const productModel = require("../models/productModel");
const ObjectId = mongoose.Types.ObjectId;

const createOrder = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { paymentMethod, paymentId, addressId, cartId } = req.body;

    const cartData = await cartModel.aggregate([
      {
        $match: {
          _id: new ObjectId(cartId),
        },
      },
      {
        $unwind: "$products",
      },
      {
        $lookup: {
          from: "products",
          localField: "products.id",
          foreignField: "_id",
          as: "productData",
        },
      },
      {
        $unwind: "$productData",
      },
      {
        $project: {
          _id: 0,
          id: "$productData._id",
          price: "$productData.price",
          quantity: "$products.quantity",
          subTotal: { $multiply: ["$productData.price", "$products.quantity"] },
        },
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$subTotal" },
          products: {
            $push: {
              id: "$id",
              price: "$price",
              quantity: "$quantity",
              subTotal: "$subTotal",
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          totalAmount: 1,
          products: 1,
        },
      },
    ]);

    const totalAmount = cartData[0].totalAmount;
    const productData = cartData[0].products;

    const newOrder = await orderModel.create({
      userId: userId,
      addressId: addressId,
      paymentMethod: paymentMethod,
      paymentId: paymentId,
      products: productData,
      totalAmount: totalAmount,
    });

    await cartModel.findByIdAndDelete(cartId);

    for (const product of productData) {
      const productId = product.id;

      await productModel.findByIdAndUpdate(productId, {
        $inc: { quantity: -product.quantity },
      });
    }

    res.status(200).json({ orderId: newOrder.orderId });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getOrder = async (req, res) => {
  try {
    const id = req.params.id;

    const OrderData = await orderModel.aggregate([
      {
        $match: {
          _id: new ObjectId(id),
        },
      },
      {
        $unwind: "$products",
      },
      {
        $lookup: {
          from: "products",
          localField: "products.id",
          foreignField: "_id",
          as: "productData",
        },
      },
      {
        $lookup: {
          from: "addresses",
          localField: "addressId",
          foreignField: "_id",
          as: "address",
        },
      },
      {
        $unwind: "$productData",
      },
      {
        $project: {
          _id: 1,
          orderId: 1,
          orderDate: 1,
          totalAmount: 1,
          status: 1,
          paymentMethod: 1,
          paymentId: 1,
          deliveredDate: 1,
          products: {
            id: 1,
            imageUrl: { $first: "$productData.imageURLHighRes" },
            title: "$productData.title",
            price: 1,
            quantity: 1,
            subTotal: 1,
          },
          totalItems: { $sum: 1 },
          address: { $arrayElemAt: ["$address", 0] },
        },
      },
      {
        $group: {
          _id: "$_id",
          orderId: { $first: "$orderId" },
          orderDate: { $first: "$orderDate" },
          totalAmount: { $first: "$totalAmount" },
          status: { $first: "$status" },
          paymentMethod: { $first: "$paymentMethod" },
          paymentId: { $first: "$paymentId" },
          deliveredDate: { $first: "$deliveredDate" },
          products: { $push: "$products" },
          totalItems: { $sum: "$totalItems" },
          address: { $first: "$address" },
        },
      },
      {
        $project: {
          _id: 1,
          orderId: 1,
          orderDate: 1,
          totalAmount: 1,
          status: 1,
          products: 1,
          totalItems: 1,
          paymentMethod: 1,
          paymentId: 1,
          deliveredDate: 1,
          "address.title": 1,
          "address.street": 1,
          "address.city": 1,
          "address.state": 1,
          "address.country": 1,
          "address.zipCode": 1,
          "address.mobileNumber": 1,
        },
      },
    ]);

    res.status(200).json({ data: OrderData[0] });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllUserOrder = async (req, res) => {
  try {
    const id = req.user.userId;

    const OrderData = await orderModel.aggregate([
      {
        $match: {
          userId: id,
        },
      },
      {
        $unwind: "$products",
      },
      {
        $lookup: {
          from: "products",
          localField: "products.id",
          foreignField: "_id",
          as: "productData",
        },
      },
      {
        $unwind: "$productData",
      },
      {
        $project: {
          _id: 1,
          orderId: 1,
          orderDate: 1,
          totalAmount: 1,
          status: 1,
          products: {
            id: 1,
            imageUrl: { $first: "$productData.imageURLHighRes" },
            title: "$productData.title",
            price: 1,
            quantity: 1,
          },
          totalItems: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: "$_id",
          orderId: { $first: "$orderId" },
          orderDate: { $first: "$orderDate" },
          totalAmount: { $first: "$totalAmount" },
          status: { $first: "$status" },
          products: { $push: "$products" },
          totalItems: { $sum: "$totalItems" },
        },
      },
      {
        $project: {
          _id: 1,
          orderId: 1,
          orderDate: 1,
          totalAmount: 1,
          status: 1,
          products: { $slice: ["$products", 2] },
          totalItems: 1,
        },
      },
      {
        $sort: { orderDate: -1 },
      },
    ]);

    res.status(200).json({ data: OrderData });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllOrder = async (req, res) => {
  try {
    const allOrders = await orderModel.find();
    res.status(200).json({ data: allOrders });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateOrder = async (req, res) => {
  try {
    const id = req.params.id;
    const { title } = req.body;
    const toUpdateData = await orderModel.findById(id);

    toUpdateData.title = title || toUpdateData.title;

    await toUpdateData.save();
    res.status(200).json({ data: toUpdateData });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const cancelOrder = async (req, res) => {
  try {
    const id = req.params.id;

    await orderModel.findByIdAndUpdate(id, {
      status: "Cancelled",
    });

    res.status(200).json({ status: "Cancelled", id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteOrder = async (req, res) => {
  try {
    const id = req.params.id;
    const data = await productModel.findByIdAndUpdate(id, { active: false });
    res.status(200).json({ data: data });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createOrder,
  getOrder,
  getAllUserOrder,
  getAllOrder,
  updateOrder,
  cancelOrder,
  deleteOrder,
};
