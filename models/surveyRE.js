const mongoose = require('mongoose');

const surveyRESchema = new mongoose.Schema({
    cuenta: {
        type: String,
        unique: true,
        trim: true,
        maxlength: [8,"La cuenta debe de tener como maximo 8 caracteres."]
    },
    fechaInscripcion:{
        type: Date,
    },
    nombre:{
        type: String,
        trim: true,
        maxlength: [100,"El nombre debe de tener como maximo 100 caracter"]
    },
    espacio:{
        type: String,
        trim: true,
        maxlength: [100,"El espacio debe de tener como maximo 100 caracter"]
    },
    plan:{
        type: String,
        trim: true,
        maxlength: [100,"El plan debe de tener como maximo 100 caracter"]
    },
    clavePlan:{
        type: String,
        trim: true,
        maxlength: [100,"La clave debe de tener como maximo 100 caracter"]
    },
    sexo:{
        type: String,
        trim: true,
        maxlength: [100,"El nombre debe de tener como maximo 100 caracter"]
    },
    egreso:{
        type: String,
        trim: true,
        maxlength: [100,"El egreso debe de tener como maximo 100 caracter"]
    },
    periodo:{
        type: String,
        trim: true,
        maxlength: [100,"El periodo debe de tener como maximo 100 caracter"]
    },
    pais:{
        type: String,
        trim: true,
        maxlength: [100,"El pais debe de tener como maximo 100 caracter"]
    },
    estado:{
        type: String,
        trim: true,
        maxlength: [100,"El estado debe de tener como maximo 100 caracter"]
    },
    municipio:{
        type: String,
        trim: true,
        maxlength: [100,"El municipio debe de tener como maximo 100 caracter"]
    },
    preguntas:[
        {
            pregunta: {
                type:mongoose.Schema.ObjectId,
                ref: 'dictionaryRE'
            },
            respuesta: {
                type: String,
                trim: true,
                maxlength: [500,"La respuesta de la pregunta debe de tener como maximo 500 caracter"],
            }
        }
    ]
});

surveyRESchema.pre('find', function(next) {
    // Obtén el arreglo de preguntas
    this.populate({
        path: 'preguntas.pregunta',
        select: 'identificador'
    });
    next();
});

const SurveyDAE = mongoose.model("surveyRE",surveyRESchema);
module.exports = SurveyDAE;
