const express = require("express");
const {
  addBrand,
  getBrand,
  getAllBrand,
  updateBrand,
  deleteBrand,
} = require("../controllers/brandController");

const router = express.Router();

const { isAuth, isAdmin } = require("../middlewares/verifyToken");

router.post("/add", isAuth, isAdmin, addBrand);

router.get("/:id", isAuth, getBrand);

router.get("/", isAuth, getAllBrand);

router.put("/:id", isAuth, isAdmin, updateBrand);

router.delete("/:id", isAuth, isAdmin, deleteBrand);

module.exports = router;
