const User = require('../models/user');
const Archivo = require('../utils/Archivo');
const catchAsync = require('../utils/CatchAsync');
const AppError = require('../utils/AppError');
const {deleteOne, updateOne, getOne, getAll} = require('../controllers/handleFactory')

const getMe = (req,res,next)=>{
    req.params.id = req.user.id;
    next();
}

const createUser=catchAsync(async(req,res,next)=>{
    res.status(200).json({
        message: "Este ruta no esta disponible, Porfavor use la ruta de users/registro"
    }) 
});

const allUsers = getAll(User);

const oneUser = getOne(User);

const updateUser = updateOne(User);

const deleteUser = deleteOne(User);

module.exports = {createUser, oneUser,allUsers,deleteUser,updateUser, getMe};