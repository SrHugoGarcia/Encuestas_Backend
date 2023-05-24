const catchAsync = require('../utils/CatchAsync');
const Archivo = require('../utils/Archivo');
const multer = require('multer');
const xlsx = require('xlsx');
const DictionaryRE = require('../models/dictionaryRE');
const SurveyRE = require('../models/surveyRE');
const AppError = require('../utils/AppError')
const { getAll } = require('./handleFactory');
//#region Configuracion de multer
    //Se maneja el archivo en la memoria
    const multerStorage = multer.memoryStorage();

    //Se verifica que el Documento sea un Excel
    const multerFilter = (req,file,cb)=>{
        if(file.mimetype.startsWith('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')){
            cb(null,true)
        }else{
            //Le pasamos un error
            cb(new AppError("No es una archivo excel. Porfavor cargue solo un archivo excel",400),false)
        }
    }

    //Se le pasa la verificacion y se maneja la memoria
    const upload = multer({
        storage : multerStorage,
        fileFilter : multerFilter
    })
    //Configuramos con que nombre recibieremos el archivo y la cantidad maxima
    const uploadExcel = upload.fields([
        {name: "excelEncuestaRE", maxCount: 1},
    ])
//#endregion


//Guardamos el excel, debido a que recibimos el buffer 
const saveExcel = catchAsync(async(req,res,next)=>{
  console.log(req.files)

    //Validamos si existe el excel
    if(!req.files.excelEncuestaRE) return next(new AppError("No existe el excel",400)); 
    const fileName= `excel-${Date.now()}.xlsx`;
    const route = `${__dirname}/../public/servidor/Encuestas/Egreso/${fileName}`;
    const buffer = req.files.excelEncuestaRE[0].buffer;
    req.body.excel= { fileName,route,content: buffer };
    next();
});

//Leer el excel 
const readExcel = catchAsync(async(req,res,next)=>{
    const excel = xlsx.read(req.body.excel.content, { type: "buffer" });
    if(!excel) return next(new AppError("No se pudo leer el excel",400));
    req.body.excel.content = excel;
    next();
});
const eliminateExcel = catchAsync(async(req,res,next)=>{
    const wait =await new Archivo(req.body.excel.route,"").eliminateFile()
        .then(res =>{ return "successful" })
            .catch(err=>{ return "error" });
    if(wait == "error" || wait != "successful")  return next(new AppError("No se pudo eliminar el excel",400)); 
    next();
})
 /*
     const options = {
        blankrows: false,
        defval: "", 
    };
    */

const extractData = catchAsync(async (req, res, next) => {
  const dictionaryRE = await DictionaryRE.find().sort({ numero: 1 });
  const sheetName = req.body.excel.content.SheetNames[0];
    const sheet = req.body.excel.content.Sheets[sheetName];
    const options = {
      blankrows: false,
      defval: "",
      header: 1,
    };
    let x=0;
    const dataRecords = xlsx.utils.sheet_to_json(sheet, options);
    let contador=0;
    const data = dataRecords.map((record,index) => {
      let registro
        registro = {
          fechaInscripcion:(index==1) ? "": convertDate(record[1]),
          cuenta: record[3],
          nombre: record[4],
          espacio: record[5],
          plan: record[6],
          clavePlan: record[7],
          sexo: record[8],
          egreso: record[9],
          periodo: record[10],
          pais: record[11],
          estado: record[12],
          municipio: record[13],
          preguntas: [],
        };
        let contador=0;
        record.forEach((value, index) => {
            if(index>13){
                console.log(index + " " + value + " " + contador)
                if(index == 23 || index == 51 || index == 85 ){
                    contador++;
                    registro.preguntas.push({
                        pregunta: dictionaryRE[contador]._id,
                        respuesta: value,
                        opciones: [],
                        otro: "",
                    });
                }else{
                    registro.preguntas.push({
                        pregunta: dictionaryRE[contador]._id,
                        respuesta: value,
                        opciones: [],
                        otro: "",
                    });
                }
                contador++;  
            }
        });
      
      return registro;
    });
    req.body.dataSurveyRE = data;
    next();
  });

  const saveDataSurveyRE=catchAsync(async(req,res,next)=>{
    // Crear una copia del array original sin modificarlo
    const dataSurveyRE = req.body.dataSurveyRE.slice();
    
    // Eliminar el primer elemento del array copiado
    dataSurveyRE.shift();
    const wait = await SurveyRE.insertMany(dataSurveyRE);
    if(!wait){
      return next(new AppError("Hubo un error al guardar los datos.",400)); 
    }
    return res.status(201).json({status: "successful", data:wait}); 
  })

  const convertDate=(numberOfDays)=> {
    if(!numberOfDays) return ""
    var milisegundos = numberOfDays * 24 * 60 * 60 * 1000;
    var fecha = new Date(milisegundos);
    return fecha;
  }

  const validateSurveysREExists = catchAsync(async(req,res,next)=>{
    const wait = await SurveyRE.find();
    if(wait[0])  return next(new AppError("Ya existen datos en la base de datos.",400)); 
    next();
})

const deleteAllSurveysRE = catchAsync(async(req,res,next)=>{
    const wait = await SurveyRE.deleteMany({});
    if(wait.acknowledged === true){
      return res.status(204).json({status: "successful", message: "Documentos eliminados" }); 
    }
    return next(new AppError("Hubo un error al elimnar los datos",400)); 
})

const getAllSurveysRE = getAll(SurveyRE);

const deleteAllSurveysREAndDeleteAllDictionary = catchAsync(async(req,res,next)=>{
  const wait = await DictionaryRE.deleteMany({});
  const wait2 = await SurveyRE.deleteMany({});
  if(wait.acknowledged === true && wait2.acknowledged === true){
    return res.status(204).json({status: "successful", message: "Documentos eliminados" }); 
  }
  return next(new AppError("Hubo un error al elimnar los datos",400)); 
})
module.exports = { validateSurveysREExists,saveExcel, uploadExcel, readExcel, eliminateExcel, extractData,saveDataSurveyRE,
    deleteAllSurveysRE, getAllSurveysRE,deleteAllSurveysREAndDeleteAllDictionary };