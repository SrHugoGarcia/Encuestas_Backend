const express = require('express');
const surveyDAERoutes = require('../routes/surveyDAERoutes');
const dictionaryDAERoutes = require('../routes/dictionaryDAERoutes');
const userRoutes = require('../routes/userRoutes');
const dictionaryRERoutes  = require('../routes/dictionaryRERoutes');
const surveyRERoutes = require('../routes/surveyRERoutes');
const cookieParser = require('cookie-parser');
const AppError = require('../utils/AppError');
const morgan = require('morgan');
const erroresGlobales = require('../controllers/errorController');
const cors = require('cors')

const app = express();

if(process.env.NODE_ENV === 'development'){
    //nos da la informacion de la solicitud en consola
    app.use(morgan('dev'));
}

app.use(express.json({limit: '10kb'}));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

//Agregaremos un m middlware para saber la hora en que se realizan las peticiones
app.use((req,res,next) =>{
    req.requestTime = new Date().toISOString();
    next();
})

const whileList = [process.env.FRONTEND_URL2, process.env.FRONTEND_URL];
const corsOptions = {
    origin: function (origin, callback) {
      if(whileList.includes(origin)){
        callback(null,true)
      }else{
        callback(new AppError("No tienes el acceso a la api",401))
      }
    },    
    credentials: true
  }
app.use(cors(corsOptions))

app.use("/api/v1/surveyDAE",surveyDAERoutes);
app.use("/api/v1/surveyRE",surveyRERoutes);
app.use("/api/v1/dictionaryDAE",dictionaryDAERoutes);
app.use("/api/v1/dictionaryRE",dictionaryRERoutes);
app.use('/api/v1/users',userRoutes);

app.all('*',(req,res,next)=>{
    next(new AppError(`No se encuentra ${req.originalUrl} en este servidor`,404))
})

//MANEJO DE ERRORES A NIVEL GLOBAL
app.use(erroresGlobales)

module.exports = app;




