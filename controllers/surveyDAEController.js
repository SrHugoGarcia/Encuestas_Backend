const catchAsync = require('../utils/CatchAsync');
const Archivo = require('../utils/Archivo');
const multer = require('multer');
const xlsx = require('xlsx');
const DictionaryDAE = require('../models/dictionaryDAE');
const SurveyDAE = require('../models/surveyDAE');
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
        {name: "excelEncuestaDAE", maxCount: 1},
    ])
//#endregion


//Guardamos el excel, debido a que recibimos el buffer 
const saveExcel = catchAsync(async(req,res,next)=>{
    //Validamos si existe el excel
    if(!req.files.excelEncuestaDAE) return next(new AppError("No existe el excel",400)); 
    const fileName= `excel-${Date.now()}.xlsx`;
    const route = `${__dirname}/../public/servidor/Encuestas/Dos años/${fileName}`;
    const buffer = req.files.excelEncuestaDAE[0].buffer;
    const wait = await new Archivo(route,buffer).createFile()
        .then(res =>{ return {status: "successful"}})
            .catch(err=>{ return "error" });
    if(wait == "error" || wait.status!= "successful") return next(new AppError("Error al guardar el excel",400)); 
    req.body.excel= { fileName,route,content: "" };
    next();
});

//Leer el excel 
const readExcel = catchAsync(async(req,res,next)=>{
    const excel = xlsx.readFile(req.body.excel.route);
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
  const dictionaryDAE = await DictionaryDAE.find().sort({ numero: 1 });
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
      console.log(record[index])
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
          
          if(index>=14){
            if (index === 20) {
              registro.preguntas[5].otro = value;
            } else if (index === 25) {
              registro.preguntas[9].otro = value;
            } else if (index === 38) {
              registro.preguntas.push({
                pregunta: dictionaryDAE[contador]._id,
                respuesta: "",
                opciones: [
                  {
                    pregunta: dictionaryDAE[contador++]._id,
                    respuesta: value,
                  },
                ],
                otro: "",
              });
              contador++;
            } else if (index >= 39 && index <= 45) {
              registro.preguntas[22].opciones.push({
                pregunta: dictionaryDAE[contador]._id,
                respuesta: value,
              });
              contador++;
            }else if(index === 46){
                registro.preguntas.push({
                    pregunta: dictionaryDAE[contador]._id,
                    respuesta: "",
                    opciones: [
                        {
                          pregunta: dictionaryDAE[contador++]._id,
                          respuesta: value,
                        }],                
                    otro: "",
                  });
                  contador++;
              }else if (index >= 47 && index <= 55) {
                registro.preguntas[23].opciones.push({
                  pregunta: dictionaryDAE[contador]._id,
                  respuesta: value,
                });
                contador++;
              }else if(index === 58){
                registro.preguntas.push({
                    pregunta: dictionaryDAE[contador]._id,
                    respuesta: "",
                    opciones: [
                        {
                          pregunta: dictionaryDAE[contador=contador+1]._id,
                          respuesta: value,
                        }],                
                    otro: "",
                  });
                  contador++;
              }else if (index >= 59 && index <= 61) {
                registro.preguntas[26].opciones.push({
                  pregunta: dictionaryDAE[contador]._id,
                  respuesta: value,
                });
                contador++;
              }else if(index === 63){
                registro.preguntas.push({
                    pregunta: dictionaryDAE[contador]._id,
                    respuesta: "",
                    opciones: [
                        {
                          pregunta: dictionaryDAE[contador=contador+1]._id,
                          respuesta: value,
                        }],                
                    otro: "",
                  });
                  contador++;
              }else if (index >= 64 && index <= 69) {
                registro.preguntas[28].opciones.push({
                  pregunta: dictionaryDAE[contador]._id,
                  respuesta: value,
                });
                contador++;
              }else if (index === 72) {
                registro.preguntas[30].otro = value;
              }else if(index === 74){
                registro.preguntas.push({
                    pregunta: dictionaryDAE[contador]._id,
                    respuesta: "",
                    opciones: [
                        {
                          pregunta: dictionaryDAE[contador=contador+1]._id,
                          respuesta: value,
                        }],                
                    otro: "",
                  });
                  contador++;
              }else if (index >= 74 && index <= 75) {
                registro.preguntas[32].opciones.push({
                  pregunta: dictionaryDAE[contador]._id,
                  respuesta: value,
                });
                contador++;
              } else if(index === 87){
                registro.preguntas.push({
                    pregunta: dictionaryDAE[contador]._id,
                    respuesta: "",
                    opciones: [
                        {
                          pregunta: dictionaryDAE[contador=contador+1]._id,
                          respuesta: value,
                        }],                
                    otro: "",
                  });
                  contador++;
              }else if (index >= 88 && index <= 89) {
                registro.preguntas[44].opciones.push({
                  pregunta: dictionaryDAE[contador]._id,
                  respuesta: value,
                });
                contador++;
              } else if(index === 90){
                registro.preguntas.push({
                    pregunta: dictionaryDAE[contador]._id,
                    respuesta: "",
                    opciones: [
                        {
                          pregunta: dictionaryDAE[contador=contador+1]._id,
                          respuesta: value,
                        }],                
                    otro: "",
                  });
                  contador++;
              }else if (index >= 91 && index <= 94) {
                registro.preguntas[45].opciones.push({
                  pregunta: dictionaryDAE[contador]._id,
                  respuesta: value,
                });
                contador++;
              }else if(index === 95){
                registro.preguntas.push({
                    pregunta: dictionaryDAE[contador]._id,
                    respuesta: "",
                    opciones: [
                        {
                          pregunta: dictionaryDAE[contador=contador+1]._id,
                          respuesta: value,
                        }],                
                    otro: "",
                  });
                  contador++;
              }else if (index >= 96 && index <= 102) {
                registro.preguntas[46].opciones.push({
                  pregunta: dictionaryDAE[contador]._id,
                  respuesta: value,
                });
                contador++;
              }else if(index === 118){
                registro.preguntas.push({
                    pregunta: dictionaryDAE[contador]._id,
                    respuesta: "",
                    opciones: [
                        {
                          pregunta: dictionaryDAE[contador]._id,
                          respuesta: value,
                        }],                
                    otro: "",
                  });
                  contador++;
              }else if (index > 118 && index <= 119) {
                registro.preguntas[48].opciones.push({
                  pregunta: dictionaryDAE[contador]._id,
                  respuesta: value,
                });
                contador++;
              }else if(index === 120){
                registro.preguntas.push({
                    pregunta: dictionaryDAE[contador]._id,
                    respuesta: "",
                    opciones: [
                        {
                          pregunta: dictionaryDAE[contador]._id,
                          respuesta: value,
                        }],                
                    otro: "",
                  });
                  contador++;
              }else if (index >= 121 && index <= 126) {
              
                registro.preguntas[49].opciones.push({
                  pregunta: dictionaryDAE[contador]._id,
                  respuesta: value,
                });
                contador++;
              }else if(index === 127){
              
                registro.preguntas[49].otro = value
                contador++
              }else if( index >=104 && index<=117){
              }else {
                registro.preguntas.push({
                pregunta: dictionaryDAE[contador]._id,
                respuesta: value,
                opciones: [],
                otro: "",
              });
              contador++;
            }
          }
          
        });
      
       
      return registro;
    });
    req.body.dataSurveyDAE = data;
    next();
  });

  const saveDataSurveyDAE=catchAsync(async(req,res,next)=>{
    // Crear una copia del array original sin modificarlo
    const dataSurveyDAE = req.body.dataSurveyDAE.slice();

    // Eliminar el primer elemento del array copiado
    dataSurveyDAE.shift();
    const wait = await SurveyDAE.insertMany(dataSurveyDAE);
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

  const validateSurveysDAEExists = catchAsync(async(req,res,next)=>{
    const wait = await SurveyDAE.find();
    if(wait[0])  return next(new AppError("Ya existen datos en la base de datos.",400)); 
    next();
})

const deleteAllSurveysDAE = catchAsync(async(req,res,next)=>{
    const wait = await SurveyDAE.deleteMany({});
    if(wait.acknowledged === true){
      return res.status(204).json({status: "successful", message: "Documentos eliminados" }); 
    }
    return next(new AppError("Hubo un error al elimnar los datos",400)); 
})
//¿Qué porcentaje de encuestados trabaja actualmente?
const getPercentageOfRespondentsCurrentlyWorkSurveys = catchAsync(async(req,res,next)=>{
    const wait = await SurveyDAE.aggregate([
      {
        $project: {
          "pregunta": { $arrayElemAt: ["$preguntas.pregunta", 0] },
          "respuesta": { $arrayElemAt: ["$preguntas.respuesta", 0] },
          _id: 0
        },
      },{
        $lookup: {
          from: 'dictionarydaes',
          localField: 'pregunta',
          foreignField: '_id',
          as: 'pregunta'
        }
      },
      {
        $project: {
          "pregunta": { $arrayElemAt: ["$pregunta.identificador", 0] },
          "respuesta": "$respuesta",
          _id: 0
        },
      },
      {
        $group: {
          _id: { $toUpper: "$pregunta" },
          respuestasTotal: { $sum: 1 },
          respuestasFiltradas: { 
            $sum: {
              $cond: [
                { $or: [
                  { $ne: ["$respuesta", "No"] }, // Condición 1
                  { $eq: ["$respuesta", ""] } // Condición 2
                ]},
                0, // Valor si se cumple alguna de las condiciones
                1 // Valor por defecto si no se cumple ninguna condición
              ]
            }
          }
        }
      },
      {
        $project: {
          respuestasTotal: 1,
          respuestasFiltradas: 1,
          promedioRespuestas: {
            $multiply: [
              { $divide: ["$respuestasFiltradas", "$respuestasTotal"] }, // Dividir respuestasFiltradas por respuestasTotal
              100 // Multiplicar por 100 para obtener el porcentaje
            ]
          }
        }
      }
    ]);
    res.status(200).json({
      status: "successful",
      data: wait
    })
})
//¿cuántos de ellos están en su primer trabajo después de graduarse? 
const getPercentageWorksAfterGraduatingSurveys = catchAsync(async(req,res,next)=>{
  const wait = await SurveyDAE.aggregate([
    {
      $project: {
        "pregunta": { $arrayElemAt: ["$preguntas.pregunta", 1] },
        "respuesta": { $arrayElemAt: ["$preguntas.respuesta", 1] },
        _id: 0
      },
    },{
      $lookup: {
        from: 'dictionarydaes',
        localField: 'pregunta',
        foreignField: '_id',
        as: 'pregunta'
      }
    },
    {
      $project: {
        "pregunta": { $arrayElemAt: ["$pregunta.identificador", 0] },
        "respuesta": "$respuesta",
        _id: 0
      },
    },
    {
      $group: {
        _id: { $toUpper: "$pregunta" },
        respuestasTotal: { $sum: 1 },
        respuestasFiltradas: { 
          $sum: {
            $cond: [
              { $or: [
                { $ne: ["$respuesta", "No"] }, // Condición 1
                { $eq: ["$respuesta", ""] } // Condición 2
              ]},
              0, // Valor si se cumple alguna de las condiciones
              1 // Valor por defecto si no se cumple ninguna condición
            ]
          }
        }
      }
    },
    {
      $project: {
        respuestasTotal: 1,
        respuestasFiltradas: 1,
        promedioRespuestas: {
          $multiply: [
            { $divide: ["$respuestasFiltradas", "$respuestasTotal"] }, // Dividir respuestasFiltradas por respuestasTotal
            100 // Multiplicar por 100 para obtener el porcentaje
          ]
        }
      }
    }
  ]);
  res.status(200).json({
    status: "successful",
    data: wait
  })
})
//¿Cuánto tiempo les tomó obtener su primer empleo? 
const getPercentageCurrentEmploymentTimeSurveyed = catchAsync(async(req,res,next)=>{
  const wait = await SurveyDAE.aggregate([
    {
      $project: {
        "pregunta": { $arrayElemAt: ["$preguntas.pregunta", 3] },
        "respuesta": { $arrayElemAt: ["$preguntas.respuesta", 3] },
        _id: 0
      },
    },{
      $lookup: {
        from: 'dictionarydaes',
        localField: 'pregunta',
        foreignField: '_id',
        as: 'pregunta'
      }
    },
    {
      $project: {
        "pregunta": { $arrayElemAt: ["$pregunta.identificador", 0] },
        "respuesta": "$respuesta",
        _id: 0
      },
    },
    {
      $group: {
        _id: { $toUpper: "$pregunta" },
        respuestasTotal: { $sum: 1 },
        respuestaMenos6Meses:{ 
          $sum: {
            $cond: [
              {
                $or: [
                  { $regexMatch: { input: "$respuesta", regex: /Menos/ } }, // Condición 1
                ]
              },
              1, // Valor si se cumple alguna de las condiciones
              0 // Valor por defecto si no se cumple ninguna condición
            ]
          }
        },
        respuestaMas1year:{ 
          $sum: {
            $cond: [
              {
                $or: [
                  { $regexMatch: { input: "$respuesta", regex: /1 a/ } }, // Condición 1
                ]
              },
              1, // Valor si se cumple alguna de las condiciones
              0 // Valor por defecto si no se cumple ninguna condición
            ]
          }
        },
        respuesta6a9Meses:{ 
          $sum: {
            $cond: [
              {
                $or: [
                  { $regexMatch: { input: "$respuesta", regex: /6 a 9/ } }, // Condición 1
                ]
              },
              1, // Valor si se cumple alguna de las condiciones
              0 // Valor por defecto si no se cumple ninguna condición
            ]
          }
        },
        respuesta9a12Meses:{ 
          $sum: {
            $cond: [
              {
                $or: [
                  { $regexMatch: { input: "$respuesta", regex: /9 a 12/ } }, // Condición 1
                ]
              },
              1, // Valor si se cumple alguna de las condiciones
              0 // Valor por defecto si no se cumple ninguna condición
            ]
          }
        },
        respuestaSinContestar:{ 
          $sum: {
            $cond: [
              { $or: [
                { $eq: ["$respuesta", ""] } // Condición 2
              ]},
              1, // Valor si se cumple alguna de las condiciones
              0 // Valor por defecto si no se cumple ninguna condición
            ]
          }
        },
      },
      
    },
    {
      $project: {
        respuestaMenos6Meses: 1,
        respuestasTotal: 1,
        promedioMenos6Meses: {
          $multiply: [
            { $divide: ["$respuestaMenos6Meses", "$respuestasTotal"] }, // Dividir respuestaMenos6Meses por respuestasTotal
            100 // Multiplicar por 100 para obtener el porcentaje
          ]
        },
        respuesta6a9Meses: 1,
        promedio6a9Meses: {
          $multiply: [
            { $divide: ["$respuesta6a9Meses", "$respuestasTotal"] }, // Dividir respuesta6a9Meses por respuestasTotal
            100 // Multiplicar por 100 para obtener el porcentaje
          ]
        },

        respuesta9a12Meses: 1,
        promedio9a12Meses: {
          $multiply: [
            { $divide: ["$respuesta9a12Meses", "$respuestasTotal"] }, // Dividir respuesta9a12Meses por respuestasTotal
            100 // Multiplicar por 100 para obtener el porcentaje
          ]
        },
        respuestaMas1year: 1,
        promedioMas1year: {
          $multiply: [
            { $divide: ["$respuestaMas1year", "$respuestasTotal"] }, // Dividir respuestaMas1year por respuestasTotal
            100 // Multiplicar por 100 para obtener el porcentaje
          ]
        },
        respuestaSinContestar: 1,
        promedioSinContestar: {
          $multiply: [
            { $divide: ["$respuestaSinContestar", "$respuestasTotal"] }, // Dividir respuestaSinContestar por respuestasTotal
            100 // Multiplicar por 100 para obtener el porcentaje
          ]
        },
        maxRespuesta: {
          $max: [
            { value: "$respuestaMenos6Meses", campo: "Menos de 6 meses" },
            { value: "$respuesta6a9Meses", campo: "De 6 a 9 meses" },
            { value: "$respuesta9a12Meses", campo: "De 9 a 12 meses" },
            { value: "$respuestaMas1year", campo: "Mas de un año" },
            { value: "$respuestaSinContestar", campo: "Respuesta sin contestar" },
          ]
        },
        maxRespuestaContestada: {
          $max: [
            { value: "$respuestaMenos6Meses", campo: "Menos de 6 meses" },
            { value: "$respuesta6a9Meses", campo: "De 6 a 9 meses" },
            { value: "$respuesta9a12Meses", campo: "De 9 a 12 meses" },
            { value: "$respuestaMas1year", campo: "Mas de un año" },
          ]
        }
      }
    },
  
  ]);
  res.status(200).json({
    status: "successful",
    results: wait.length,
    data: wait
  });
})

//Medio a través del cual encontraste tu empleo actual ¿Cuál es el medio más común a través del cual los encuestados encontraron su trabajo actual?
const getPercentageMostCommonMethodForCurrentEmploymentSurveyed = catchAsync(async(req,res,next)=>{
  const wait = await SurveyDAE.aggregate([
    {
      $project: {
        "pregunta": { $arrayElemAt: ["$preguntas.pregunta", 5] },
        "respuesta": { $arrayElemAt: ["$preguntas.respuesta", 5] },
        _id: 0
      },
    },{
      $lookup: {
        from: 'dictionarydaes',
        localField: 'pregunta',
        foreignField: '_id',
        as: 'pregunta'
      }
    },
    {
      $project: {
        "pregunta": { $arrayElemAt: ["$pregunta.identificador", 0] },
        "respuesta": "$respuesta",
        _id: 0
      },
    },
    {
      $group: {
        _id: { $toUpper: "$pregunta" },
        respuestasTotal: { $sum: 1 },
        respuestaServicioSocial:{ 
          $sum: {
            $cond: [
              {
                $or: [
                  { $regexMatch: { input: "$respuesta", regex: /Servicio/ } }, // Condición 1
                ]
              },
              1, // Valor si se cumple alguna de las condiciones
              0 // Valor por defecto si no se cumple ninguna condición
            ]
          }
        },
        respuestaBolsaTrabajo:{ 
          $sum: {
            $cond: [
              {
                $or: [
                  { $regexMatch: { input: "$respuesta", regex: /Bolsa de trabajo/ } }, // Condición 1
                ]
              },
              1, // Valor si se cumple alguna de las condiciones
              0 // Valor por defecto si no se cumple ninguna condición
            ]
          }
        },
        respuestaRecomendacionConocidos:{ 
          $sum: {
            $cond: [
              {
                $or: [
                  { $regexMatch: { input: "$respuesta", regex: /conocidos/ } }, // Condición 1
                ]
              },
              1, // Valor si se cumple alguna de las condiciones
              0 // Valor por defecto si no se cumple ninguna condición
            ]
          }
        },
        respuestaBolsaTrabajoVirtual:{ 
          $sum: {
            $cond: [
              {
                $or: [
                  { $regexMatch: { input: "$respuesta", regex: /virtual/ } }, // Condición 1
                ]
              },
              1, // Valor si se cumple alguna de las condiciones
              0 // Valor por defecto si no se cumple ninguna condición
            ]
          }
        },
        respuestaRedSocial:{ 
          $sum: {
            $cond: [
              {
                $or: [
                  { $regexMatch: { input: "$respuesta", regex: /Red/ } }, // Condición 1
                ]
              },
              1, // Valor si se cumple alguna de las condiciones
              0 // Valor por defecto si no se cumple ninguna condición
            ]
          }
        },
        respuestaOtro:{ 
          $sum: {
            $cond: [
              {
                $or: [
                  { $regexMatch: { input: "$respuesta", regex: /Otro/ } }, // Condición 1
                ]
              },
              1, // Valor si se cumple alguna de las condiciones
              0 // Valor por defecto si no se cumple ninguna condición
            ]
          }
        },
        respuestaSinContestar:{ 
          $sum: {
            $cond: [
              { $or: [
                { $eq: ["$respuesta", ""] } // Condición 2
              ]},
              1, // Valor si se cumple alguna de las condiciones
              0 // Valor por defecto si no se cumple ninguna condición
            ]
          }
        },
      },
      
    },
    {
      $project: {
        respuestasTotal: 1,
        respuestaServicioSocial: 1,
        promedioServicioSocial: {
          $multiply: [
            { $divide: ["$respuestaServicioSocial", "$respuestasTotal"] }, // Dividir respuestaServicialSocial por respuestasTotal
            100 // Multiplicar por 100 para obtener el porcentaje
          ]
        },
        respuestaBolsaTrabajo: {
           $subtract: ["$respuestaBolsaTrabajo", "$respuestaBolsaTrabajoVirtual"]  // restar
        },
        respuestaRecomendacionConocidos: 1,
        promedioRecomendacionConocidos: {
          $multiply: [
            { $divide: ["$respuestaRecomendacionConocidos", "$respuestasTotal"] }, // Dividir respuestaRecomendacionConocidos por respuestasTotal
            100 // Multiplicar por 100 para obtener el porcentaje
          ]
        },
        respuestaBolsaTrabajoVirtual: 1,
        promedioBolsaTrabajoVirtual: {
          $multiply: [
            { $divide: ["$respuestaBolsaTrabajoVirtual", "$respuestasTotal"] }, // Dividir respuestaBolsaTrabajoVirtual por respuestasTotal
            100 // Multiplicar por 100 para obtener el porcentaje
          ]
        },
        respuestaRedSocial: 1,
        promedioRedSocial: {
          $multiply: [
            { $divide: ["$respuestaRedSocial", "$respuestasTotal"] }, // Dividir respuestaRedSocial por respuestasTotal
            100 // Multiplicar por 100 para obtener el porcentaje
          ]
        },
        respuestaOtro: 1,
        promedioOtro: {
          $multiply: [
            { $divide: ["$respuestaOtro", "$respuestasTotal"] }, // Dividir respuestaOtro por respuestasTotal
            100 // Multiplicar por 100 para obtener el porcentaje
          ]
        },
        respuestaSinContestar: 1,
        promedioSinContestar: {
          $multiply: [
            { $divide: ["$respuestaSinContestar", "$respuestasTotal"] }, // Dividir respuestaSinContestar por respuestasTotal
            100 // Multiplicar por 100 para obtener el porcentaje
          ]
        },
      }
    },
    {
    $project: {
      respuestasTotal: 1,
      respuestaServicioSocial: 1,
      promedioServicioSocial: 1,
      respuestaBolsaTrabajo: 1,
      respuestaRecomendacionConocidos: 1,
      promedioRecomendacionConocidos: 1,
      respuestaBolsaTrabajoVirtual: 1,
      promedioBolsaTrabajoVirtual: 1,
      respuestaRedSocial: 1,
      promedioRedSocial: 1,
      respuestaOtro: 1,
      promedioOtro: 1,
      respuestaSinContestar: 1,
      promedioSinContestar:1,
      promedioBolsaTrabajo: {
        $multiply: [
          { $divide: ["$respuestaBolsaTrabajo", "$respuestasTotal"] }, // Dividir respuestaBolsaTrabajo por respuestasTotal
          100 // Multiplicar por 100 para obtener el porcentaje
        ]
      },
      maxRespuesta: {
        $max: [
          { value: "$respuestaServicioSocial", campo: "Servicio Social" },
          { value: "$respuestaBolsaTrabajo", campo: "Bolsa de Trabajo" },
          { value: "$respuestaBolsaTrabajoVirtual", campo: "Bolsa de Trabajo Virtual" },
          { value: "$respuestaRecomendacionConocidos", campo: "Recomendacion de Conocidos" },
          { value: "$respuestaRedSocial", campo: "Red Social" },
          { value: "$respuestaOtro", campo: "Otro" },
          { value: "$respuestaSinContestar", campo: "Respuesta sin contestar" },
        ]
      },
      maxRespuestaContestada: {
        $max: [
          { value: "$respuestaServicialSocial", campo: "Servicio Social" },
          { value: "$respuestaBolsaTrabajo", campo: "Bolsa de Trabajo" },
          { value: "$respuestaBolsaTrabajoVirtual", campo: "Bolsa de Trabajo Virtual" },
          { value: "$respuestaRecomendacionConocidos", campo: "Recomendacion de Conocidos" },
          { value: "$respuestaRedSocial", campo: "Red Social" },
          { value: "$respuestaOtro", campo: "Otro" },
        ]
      }
    }
  },
  ]);
//        
  res.status(200).json({
    status: "successful",
    results: wait.length,
    data: wait
  });
})

//¿Cuál es el nivel de relación entre la formación profesional de los encuestados que contestaron y las actividades laborales que desempeñan actualmente?
const percentageProfessionalTrainingWorkRelationshipLevel = catchAsync(async(req,res,next)=>{
  const wait = await SurveyDAE.aggregate([
    {
      $project: {
        "pregunta": { $arrayElemAt: ["$preguntas.pregunta", 6] },
        "respuesta": { $arrayElemAt: ["$preguntas.respuesta", 6] },
        _id: 0
      },
    },{
      $lookup: {
        from: 'dictionarydaes',
        localField: 'pregunta',
        foreignField: '_id',
        as: 'pregunta'
      }
    },
    {
      $project: {
        "pregunta": { $arrayElemAt: ["$pregunta.identificador", 0] },
        "respuesta": "$respuesta",
        _id: 0
      },
    },
    {
      $group: {
        _id: { $toUpper: "$pregunta" },
        respuestasTotal: { $sum: 1 },
        respuestasContestadas:{ 
          $sum: {
            $cond: [
              {
                $or: [
                  { $ne: ["$respuesta", ""] }, // Condición 1
                ]
              },
              1, // Valor si se cumple alguna de las condiciones
              0 // Valor por defecto si no se cumple ninguna condición
            ]
          }
        },
        respuestaSinContestar:{ 
          $sum: {
            $cond: [
              { $or: [
                { $eq: ["$respuesta", ""] } // Condición 2
              ]},
              1, // Valor si se cumple alguna de las condiciones
              0 // Valor por defecto si no se cumple ninguna condición
            ]
          }
        },
        nivelObtenido: { 
          $sum: {
            $toInt: {
              $cond: [
                { $ne: ["$respuesta", ""] }, // Condición 1
                "$respuesta", // Valor si se cumple la condición: convertir "respuesta" a número entero
                0 // Valor por defecto si no se cumple la condición
              ]
            }
          }
        },
       
      }
    },{
    $project: {
      respuestasTotal: 1,
      respuestasContestadas: 1,
      respuestaSinContestar:1,
      nivelRespuestasContestadas: 1,
      nivelTotalRespuestasContestadasOptimoEsperado: { $multiply: ["$respuestasContestadas", 100] },
      nivelObtenido:1
    }
    
  },
  {
    $project: {
      respuestasTotal: 1,
      respuestasContestadas: 1,
      respuestaSinContestar:1,
      nivelRespuestasContestadas: 1,
      nivelTotalRespuestasContestadasOptimoEsperado:1,
      nivelObtenido:1,
      promedioNivelObtenido: {
        $multiply: [
          { $divide: ["$nivelObtenido", "$nivelTotalRespuestasContestadasOptimoEsperado"] }, // Dividir respuestaServicialSocial por respuestasTotal
          100 // Multiplicar por 100 para obtener el porcentaje
        ]
      },
    }
  },
  {
    $project: {
      respuestasTotal: 1,
      respuestasContestadas: 1,
      respuestaSinContestar:1,
      nivelRespuestasContestadas: 1,
      nivelTotalRespuestasContestadasOptimoEsperado:1,
      nivelObtenido:1,
      promedioNivelObtenido:1,
    }
  }
  
    
  ]);
  res.status(200).json({
    status: "successful",
    results: wait.length,
    data: wait
  });
})

// ¿En qué régimen jurídico se encuentran la mayoría de las empresas en las que trabajan los encuestados? 
const percentageMajorityLegalRegime = catchAsync(async(req,res,next)=>{
  const wait = await SurveyDAE.aggregate([
    {
      $project: {
        "pregunta": { $arrayElemAt: ["$preguntas.pregunta", 8] },
        "respuesta": { $arrayElemAt: ["$preguntas.respuesta", 8] },
        _id: 0
      },
    },{
      $lookup: {
        from: 'dictionarydaes',
        localField: 'pregunta',
        foreignField: '_id',
        as: 'pregunta'
      }
    },
    {
      $project: {
        "pregunta": { $arrayElemAt: ["$pregunta.identificador", 0] },
        "respuesta": "$respuesta",
        _id: 0
      },
    },
    {
    $group: {
      _id: { $toUpper: "$pregunta" },
      respuestasTotal: { $sum: 1 },
      respuestaSectorPublico:{ 
        $sum: {
          $cond: [
            {
              $or: [
                { $regexMatch: { input: "$respuesta", regex: /ico/ } }, // Condición 1
              ]
            },
            1, // Valor si se cumple alguna de las condiciones
            0 // Valor por defecto si no se cumple ninguna condición
          ]
        }
      },
     
      respuestaSectorPrivado:{ 
        $sum: {
          $cond: [
            {
              $or: [
                { $regexMatch: { input: "$respuesta", regex: /ado/ } }, // Condición 1
              ]
            },
            1, // Valor si se cumple alguna de las condiciones
            0 // Valor por defecto si no se cumple ninguna condición
          ]
        }
      },
   
      respuestaAutoempleados:{ 
        $sum: {
          $cond: [
            {
              $or: [
                { $regexMatch: { input: "$respuesta", regex: /Autoempleados/ } }, // Condición 1
              ]
            },
            1, // Valor si se cumple alguna de las condiciones
            0 // Valor por defecto si no se cumple ninguna condición
          ]
        }
      },
      respuestaSinContestar:{ 
        $sum: {
          $cond: [
            { $or: [
              { $eq: ["$respuesta", ""] } // Condición 2
            ]},
            1, // Valor si se cumple alguna de las condiciones
            0 // Valor por defecto si no se cumple ninguna condición
          ]
        }
      },
   
    },
  },
  {
    $project: {
      respuestaSectorPublico: 1,
      respuestaSectorPrivado: 1,
      respuestaAutoempleados: 1,
      respuestaSinContestar: 1,
      promedioSectorPublico: {
        $multiply: [
          { $divide: ["$respuestaSectorPublico", "$respuestasTotal"] }, // Dividir respuestaRecomendacionConocidos por respuestasTotal
          100 // Multiplicar por 100 para obtener el porcentaje
        ]
      },

   promedioSectorPrivado: {
        $multiply: [
          { $divide: ["$respuestaSectorPrivado", "$respuestasTotal"] }, // Dividir respuestaRecomendacionConocidos por respuestasTotal
          100 // Multiplicar por 100 para obtener el porcentaje
        ]
      },

   promedioAutoempleados: {
        $multiply: [
          { $divide: ["$respuestaAutoempleados", "$respuestasTotal"] }, // Dividir respuestaRecomendacionConocidos por respuestasTotal
          100 // Multiplicar por 100 para obtener el porcentaje
        ]
      },

   promedioSinContestar: {
        $multiply: [
          { $divide: ["$respuestaSinContestar", "$respuestasTotal"] }, // Dividir respuestaRecomendacionConocidos por respuestasTotal
          100 // Multiplicar por 100 para obtener el porcentaje
        ]
      },
      maxRespuesta: {
        $max: [
          { value: "$respuestaSectorPublico", campo: "Sector Publico" },
          { value: "$respuestaSectorPrivado", campo: "Sector Privado" },
          { value: "$respuestaAutoempleados", campo: "Autoempleados" },
          { value: "$respuestaSinContestar", campo: "Sin contestar" }
        ]
      },
      maxRespuestaContestada: {
        $max: [
          { value: "$respuestaSectorPublico", campo: "Sector Publico" },
          { value: "$respuestaSectorPrivado", campo: "Sector Privado" },
          { value: "$respuestaAutoempleados", campo: "Autoempleados" },
        ]
      }
    }
  }
  
  
]);
  res.status(200).json({
    status: "successful",
    results: wait.length,
    data: wait
  });
})

//¿Qué tan importante fue el dominio del inglés en la contratación de los encuestados?
const percentageImportanceOfEnglishInHiring = catchAsync(async(req,res,next)=>{
  const wait = await SurveyDAE.aggregate([
    {
      $project: {
        "pregunta": { $arrayElemAt: ["$preguntas.pregunta", 22] },
        "respuesta": { $arrayElemAt: ["$preguntas.opciones", 22] },
        _id: 0
      },
    },
    {
      $project: {
        "pregunta": { $arrayElemAt: ["$respuesta.pregunta", 2] },
        "respuesta": { $arrayElemAt: ["$respuesta.respuesta", 2] },
        _id: 0
      },
    },
    {
      $lookup: {
        from: 'dictionarydaes',
        localField: 'pregunta',
        foreignField: '_id',
        as: 'pregunta'
      }
    },
    {
      $project: {
        "pregunta": { $arrayElemAt: ["$pregunta.identificador", 0] },
        "respuesta": "$respuesta",
        _id: 0
      },
    },
    {
      $group: {
        _id: { $toUpper: "$pregunta" },
        respuestasTotal: { $sum: 1 },
        respuestasContestadas:{ 
          $sum: {
            $cond: [
              {
                $or: [
                  { $ne: ["$respuesta", ""] }, // Condición 1
                ]
              },
              1, // Valor si se cumple alguna de las condiciones
              0 // Valor por defecto si no se cumple ninguna condición
            ]
          }
        },
        respuestaSinContestar:{ 
          $sum: {
            $cond: [
              { $or: [
                { $eq: ["$respuesta", ""] } // Condición 2
              ]},
              1, // Valor si se cumple alguna de las condiciones
              0 // Valor por defecto si no se cumple ninguna condición
            ]
          }
        },
        nivelObtenido: { 
          $sum: {
            $toInt: {
              $cond: [
                { $ne: ["$respuesta", ""] }, // Condición 1
                "$respuesta", // Valor si se cumple la condición: convertir "respuesta" a número entero
                0 // Valor por defecto si no se cumple la condición
              ]
            }
          }
        },
       
      }
    },
    {
      $project: {
        respuestasTotal: 1,
        respuestasContestadas: 1,
        respuestaSinContestar:1,
        nivelRespuestasContestadas: 1,
        nivelTotalRespuestasContestadasOptimoEsperado: { $multiply: ["$respuestasContestadas", 5] },
        nivelObtenido:1
      }
      
    },
    {
      $project: {
        respuestasTotal: 1,
        respuestasContestadas: 1,
        respuestaSinContestar:1,
        nivelRespuestasContestadas: 1,
        nivelTotalRespuestasContestadasOptimoEsperado:1,
        nivelObtenido:1,
        promedioNivelObtenido: {
          $multiply: [
            { $divide: ["$nivelObtenido", "$nivelTotalRespuestasContestadasOptimoEsperado"] }, // Dividir respuestaServicialSocial por respuestasTotal
            100 // Multiplicar por 100 para obtener el porcentaje
          ]
        },
      }
    },
  ]);
  
  res.status(200).json({
    status: "successful",
    results: wait.length,
    data: wait
  });
})

const getAllSurveysDAE = getAll(SurveyDAE);

const deleteAllSurveysDAEAndDeleteAllDictionary = catchAsync(async(req,res,next)=>{
  const wait = await DictionaryDAE.deleteMany({});
  const wait2 = await SurveyDAE.deleteMany({});
  if(wait.acknowledged === true && wait2.acknowledged === true){
    return res.status(204).json({status: "successful", message: "Documentos eliminados" }); 
  }
  return next(new AppError("Hubo un error al elimnar los datos",400)); 
})
/*
    {
        $project: {
          respuestasTotal: '$respuestasTotal',
          respuestasFiltradas: '$respuestasFiltradas',
          promedioRespuestas: { $avg: ["$respuestasTotal", "$respuestasFiltradas"] }
        }
      }
*/

module.exports = { getPercentageWorksAfterGraduatingSurveys,validateSurveysDAEExists,saveExcel, uploadExcel, readExcel, eliminateExcel, extractData,saveDataSurveyDAE,
                    deleteAllSurveysDAE, getPercentageOfRespondentsCurrentlyWorkSurveys,getPercentageCurrentEmploymentTimeSurveyed,
                    getPercentageMostCommonMethodForCurrentEmploymentSurveyed, percentageProfessionalTrainingWorkRelationshipLevel,percentageMajorityLegalRegime,
                    percentageImportanceOfEnglishInHiring, getAllSurveysDAE,deleteAllSurveysDAEAndDeleteAllDictionary };
/*
            //el 0 se salta
            console.log("com+")
            console.log(dataRecords[i][19])
            console.log(dataRecords[i][20])

            console.log("com+")
            console.log(dataRecords[i][24])
            console.log(dataRecords[i][25])

            console.log("opciones")
            console.log(dataRecords[i][38])
            console.log(dataRecords[i][45])+++++++

            console.log("opciones")
            console.log(dataRecords[i][46])
            console.log(dataRecords[i][55])+++++++++++


            console.log("opciones")
            console.log(dataRecords[i][58])
            console.log(dataRecords[i][61])++++++++


            console.log("opciones")
            console.log(dataRecords[i][63])
            console.log(dataRecords[i][69])+++++++


            console.log("com+")
            console.log(dataRecords[i][71])
            console.log(dataRecords[i][72])+++++++


            console.log("opciones")
            console.log(dataRecords[i][74])
            console.log(dataRecords[i][75])+++


            console.log("opciones")
            console.log(dataRecords[i][87])
            console.log(dataRecords[i][89])++++


            console.log("opciones")
            console.log(dataRecords[i][90])
            console.log(dataRecords[i][94])+++++++


            console.log("opciones")
            console.log(dataRecords[i][95])
            console.log(dataRecords[i][102])+++++++++++++


            console.log("opciones")
            console.log(dataRecords[i][118])
            console.log(dataRecords[i][119])++++++


            console.log("opciones y com")
            console.log(dataRecords[i][120])
            console.log(dataRecords[i][127])
        }*/
    
    /* data[95].preguntas.push({
         nombre: "ola"
     })*/


