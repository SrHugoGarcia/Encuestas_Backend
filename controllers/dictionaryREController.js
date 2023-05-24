const catchAsync = require('../utils/CatchAsync');
const Archivo = require('../utils/Archivo');
const multer = require('multer');
const xlsx = require('xlsx');
const AppError = require('../utils/AppError')
const DictionaryRE = require('../models/dictionaryRE');
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
        {name: "excelDictionaryRE", maxCount: 1},
    ])
//#endregion


//Guardamos el excel, debido a que recibimos el buffer 
const saveExcel = catchAsync(async(req,res,next)=>{
    //Validamos si existe el excel
    console.log(req.files)
    if(!req.files.excelDictionaryRE) return next(new AppError("No existe el excel",400)); 
    const fileName= `excel-${Date.now()}.xlsx`;
    const route = `${__dirname}/../public/servidor/Encuestas/Egreso/${fileName}`;
    const buffer = req.files.excelDictionaryRE[0].buffer;
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
    if(wait == "error" || wait != "successful") return next(new AppError("No se pudo eliminar el excel",400)); 
    next();
})
 /*
     const options = {
        blankrows: false,
        defval: "", 
    };
    */

const extractData = catchAsync(async (req, res, next) => {
    const sheetName = req.body.excel.content.SheetNames[0];
    const sheet = req.body.excel.content.Sheets[sheetName];
    const options = {
      blankrows: false,
      defval: "",
      header: 1,
    };
  
    const dataRecords = xlsx.utils.sheet_to_json(sheet, options);
    const dataDictionary = [];
    const data = dataRecords.map((record,index) => {
        if(!record[0] || !record[1]){
             return next(new AppError("Algun campo del excel se encuentra vacio.",400)); 
        };
        dataDictionary.push({
            pregunta: record[0],
            identificador: record[1],
            numero: index + 1
        });
    });
    req.body.dataDictionary = dataDictionary;
    next();
  });

  const saveDataDictionary = catchAsync(async(req,res,next)=>{
        const wait = await DictionaryRE.insertMany(req.body.dataDictionary);
        if(!wait){
            return next(new AppError("Hubo un error al guardar los datos.",400)); 
        }      
        return res.json({status: "successful", data:wait}); 
  })

  const validateDictionarysExists = catchAsync(async(req,res,next)=>{
        const wait = await DictionaryRE.find();
        if(wait[0])  return next(new AppError("Ya existen datos en la base de datos.",400)); 
        next();
  })

  const deleteAllDictionarysRE = catchAsync(async(req,res,next)=>{
    const wait = await DictionaryRE.deleteMany({});
    if(wait.acknowledged === true){
      return res.status(204).json({status: "successful", message: "Documentos eliminados" }); 
    }
    return next(new AppError("Hubo un error al elimnar los datos",400)); 
})

const getAllDictionarysRE = getAll(DictionaryRE);


module.exports = { deleteAllDictionarysRE,validateDictionarysExists,saveExcel, uploadExcel, readExcel, 
                    eliminateExcel, extractData, saveDataDictionary,getAllDictionarysRE };