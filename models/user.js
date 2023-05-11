const mongoose = require('mongoose');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    cuenta:{
        type: Number,
        required: [true,"Un usuario debe de tener una cuenta"],
        min: [6,"La cuenta debe de tener como minimo 3 caracteres"],
        unique:[true]
    },
    password:{
        type: String,
        required: [true,"Un usuario debe de tener una contraseña"],
        minlength: [8,"Una contraseña debe de tener como minimo 8 caracteres"],
        maxlength: [64,"Una contraseña debe de tener como maximo 64 caracteres"],
        select: false
    },
    confirmarPassword: {
        type: String,
        required: [true,"Porfavor confirma tu contraseña"],
        //Solo sirve para save o create esta validacion
        validate: {
            validator: function(val){
                return val === this.password;
            },
        message: "Las constraseñas no coinciden"
        }
    },
    token:String,
    role:{
        type: String,
        trim: true,
        default: "admin",
        enum: ["user", "admin"],
    }
})


//Hashando contraseña antes de que se guarde

userSchema.pre('save',async function(next){
    if(!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password,12);
    this.confirmarPassword = undefined;
    next();
})

userSchema.pre('save',function(next){
    this.token = Date.now().toString(32) + Math.random().toString(32).substring(2);
    next();
})


//Comparar contraseñas cunado se login user

userSchema.methods.correctaContraseña =async function(candidatoContraseña, userContraseña){
    return await bcrypt.compare(candidatoContraseña,userContraseña);
}

const User = mongoose.model("User",userSchema);
module.exports = User;
