const express = require('express');

const { validateSurveysREExists,saveExcel, uploadExcel, readExcel, eliminateExcel, extractData,
    saveDataSurveyRE, deleteAllSurveysRE, deleteAllSurveysREAndDeleteAllDictionary,getAllSurveysRE } = require('../controllers/surveyREController');
    
const { protect, restrictTo } = require('../controllers/authController');

const router = express.Router();

router.route("/delete-all").delete(protect,restrictTo("user", "admin"),deleteAllSurveysRE);

router.route("/").post(protect,restrictTo("user", "admin"),validateSurveysREExists,uploadExcel,saveExcel, readExcel, extractData, saveDataSurveyRE).get(getAllSurveysRE);


module.exports = router;
