const mongoose = require('mongoose');

const dictionaryRESchema = new mongoose.Schema({
    pregunta:{
        type: String,
        unique: true,
        required: [true,"El diccionarioRE debe de tener una pregunta."],
        trim: true,
        maxlength: [500,"El diccionarioRE debe de tener como maximo 200 caracteres."]
    },
    identificador:{
        type: String,
        required: [true,"El diccionarioRE debe de tener un identificador."],
        trim: true,
        maxlength: [500,"El identificador debe de tener como maximo 200 caracteres."]
    },
    numero:{
        type: Number
    }
})

const DictionaryRE = mongoose.model("dictionaryRE",dictionaryRESchema);
module.exports = DictionaryRE;
