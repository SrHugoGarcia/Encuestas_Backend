const fs = require('fs');
class Archivo{
    constructor(ruta,buffer){
        this.ruta = ruta;
        this.buffer  = buffer;
    }
    //Metodo para crear un archivo async atraves de una promesa
     createFile() {
        return new Promise (((resolve, reject) => {
             fs.writeFile(this.ruta, this.buffer,function(err, res) {
             if (err !== null) {reject(err);}
             else {resolve(res);}
           });
        }))
    }
    //Metodo para eliminar un archivo async atraves de una promesa
    eliminateFile(){
        return new Promise(((resolve,reject)=>{
            fs.unlink(this.ruta,function(err,res){
                if (err !== null) {reject(err);}
                else {resolve(res);}
            } )
        }))
    }
    //Metodo para leer un archivo async atraves de una promesa
    readFile(){
        return new Promise(((resolve,reject)=>{
            fs.readFile(this.buffer,'utf8',function(err,res){
                if(err !==null){reject(err);}
                else {resolve(res);}
            })
        }))
    }
}

module.exports = Archivo;