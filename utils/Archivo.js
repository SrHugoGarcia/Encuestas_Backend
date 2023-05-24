const fs = require('fs');
class Archivo{
    constructor(ruta,buffer){
        this.ruta = ruta;
        this.buffer  = buffer;
    }
    //Metodo para crear un archivo async atraves de una promesa

    createFile() {
      return new Promise((resolve, reject) => {
        fs.writeFile(this.ruta, this.buffer, (err, res) => {
          if (err) {
            reject(new Error('Error al crear el archivo: ' + err.message));
          } else {
            // Establecer permisos después de crear el archivo
            fs.chmod(this.ruta, '755', (chmodErr) => {
              if (chmodErr) {
                reject(new Error('Error al establecer los permisos del archivo: ' + chmodErr.message));
              } else {
                resolve(res);
              }
            });
          }
        });
      });
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