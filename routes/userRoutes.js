//Modulo de terceros
const express = require('express');
//Modulo de sistema de archivos
const fs = require('fs');
//Modulo userController
const {createUser,allUsers,oneUser,updateUser,deleteUser, getMe } = require('../controllers/userController')
const {registro,login, protect , cerrarSesion,updatePassword } = require('../controllers/authController');
const router = express.Router();

//Autenticacion
router.route('/registration').post(registro);
router.route('/login').post(login)
router.route('/sign-off').get(cerrarSesion)

router.use(protect)
router.route('/update-my-Password').patch(updatePassword);
//Rutas para usuarios
router.route('/me').get(getMe,oneUser);

router.route('/').get(allUsers).post(createUser);
router.route('/:id').get(oneUser).patch(updateUser).delete(deleteUser);


module.exports = router;