const express = require('express');
const { protect, restrictTo } = require('../controllers/authController');
const { validateDictionarysExists, saveExcel, uploadExcel, readExcel, eliminateExcel, extractData, saveDataDictionary,
         deleteAllDictionarysRE,getAllDictionarysRE } = require('../controllers/dictionaryREController');

const router = express.Router();

router.route("/").post(protect,restrictTo("user", "admin"),validateDictionarysExists,uploadExcel,saveExcel, readExcel, extractData, saveDataDictionary).get(protect,restrictTo("user", "admin"),getAllDictionarysRE)
router.route("/delete-all").delete(protect,restrictTo("user", "admin"),deleteAllDictionarysRE);


module.exports = router;
