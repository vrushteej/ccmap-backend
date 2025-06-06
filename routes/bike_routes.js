const express = require("express");
const bikecontroller = require('../controller/bike_controller');

const router = express.Router();

router.post("/createBike", bikecontroller.createBike);
router.get("/getAllBike", bikecontroller.getAllBikes);
router.get("/getBikeById/:bikeId", bikecontroller.getBikeById);
router.put("/updateBike/:bikeId", bikecontroller.updateBike);
router.delete("/deleteBike/:bikeId", bikecontroller.deleteBike);
router.get("/getBikeQR/:bikeId", bikecontroller.getBikeQR);
router.post("/verify-qr", bikecontroller.verifyScannedQR);

module.exports = router;

