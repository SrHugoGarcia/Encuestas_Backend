const mongoose = require('mongoose');

const dictionaryDAESchema = new mongoose.Schema({
    pregunta:{
        type: String,
        unique: true,
        required: [true,"El diccionarioDAE debe de tener una pregunta."],
        trim: true,
        maxlength: [500,"El diccionarioDAE debe de tener como maximo 200 caracteres."]
    },
    identificador:{
        type: String,
        unique: true,
        required: [true,"El diccionarioDAE debe de tener un identificador."],
        trim: true,
        maxlength: [500,"El identificador debe de tener como maximo 200 caracteres."]
    },
    numero:{
        type: Number
    }
})

const DictionaryDAE = mongoose.model("dictionaryDAE",dictionaryDAESchema);
module.exports = DictionaryDAE;
