const express = require('express');

const { validateSurveysDAEExists,saveExcel, uploadExcel, readExcel, eliminateExcel, extractData,
    saveDataSurveyDAE, deleteAllSurveysDAE, getPercentageOfRespondentsCurrentlyWorkSurveys,getPercentageWorksAfterGraduatingSurveys,
    getPercentageCurrentEmploymentTimeSurveyed,getPercentageMostCommonMethodForCurrentEmploymentSurveyed,
    percentageProfessionalTrainingWorkRelationshipLevel,percentageMajorityLegalRegime,percentageImportanceOfEnglishInHiring, 
    deleteAllSurveysDAEAndDeleteAllDictionary,getAllSurveysDAE } = require('../controllers/surveyDAEController');
    
const { protect, restrictTo } = require('../controllers/authController');

const router = express.Router();

router.route("/delete-all").delete(protect,restrictTo("user", "admin"),deleteAllSurveysDAE);
router.route("/percentage-of-respondents-currently-work").get(protect,restrictTo("user", "admin"),getPercentageOfRespondentsCurrentlyWorkSurveys);
router.route("/percentage-works-after-graduating-surveys").get(protect,restrictTo("user", "admin"),getPercentageWorksAfterGraduatingSurveys);
router.route("/percentage-current-employment-time-surveys").get(protect,getPercentageCurrentEmploymentTimeSurveyed);
router.route("/percentage-most-common-method-for-current-employment-surveyed").get(protect,restrictTo("user", "admin"),getPercentageMostCommonMethodForCurrentEmploymentSurveyed);
router.route("/percentage-professional-training-work-relation-ship-level").get(protect,restrictTo("user", "admin"),percentageProfessionalTrainingWorkRelationshipLevel);
router.route("/percentage-majority-legal-regime").get(protect,restrictTo("user", "admin"),percentageMajorityLegalRegime);
router.route("/percentage-importance-of-english-in-hiring").get(protect,restrictTo("user", "admin"),percentageImportanceOfEnglishInHiring);
router.route("/delete-all-surveysDAE-and-delete-all-dictionary").delete(protect,restrictTo("user", "admin"),deleteAllSurveysDAEAndDeleteAllDictionary)
router.route("/").post(protect,restrictTo("user", "admin"),validateSurveysDAEExists,uploadExcel,saveExcel, readExcel, extractData, saveDataSurveyDAE).get(getAllSurveysDAE);


module.exports = router;
