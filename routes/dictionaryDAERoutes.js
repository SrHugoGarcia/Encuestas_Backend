const express = require('express');
const { protect, restrictTo } = require('../controllers/authController');
const { validateDictionarysExists, saveExcel, uploadExcel, readExcel, eliminateExcel, extractData, saveDataDictionary,
         deleteAllDictionarysDAE,getAllDictionarysDAE } = require('../controllers/dictionaryDAEController');

const router = express.Router();

router.route("/").post(protect,restrictTo("user", "admin"),validateDictionarysExists,uploadExcel,saveExcel, readExcel, extractData, saveDataDictionary).get(protect,restrictTo("user", "admin"),getAllDictionarysDAE)
router.route("/delete-all").delete(protect,restrictTo("user", "admin"),deleteAllDictionarysDAE);


module.exports = router;
