const fs = require('fs');
const path = require('path');

const folderPath = './json';
const outputFile = './resultadosPrueba004.txt';

fs.readdir(folderPath, (err, files) => {
  if (err) {
    console.error('Error al leer la carpeta:', err);
    return;
  }

  const writeStream = fs.createWriteStream(outputFile, { flags: 'a', encoding: 'utf-8' });

  const headerRow = "EleccionId\tIdMesa\tTotalElectores\tElectoresEscrutados\tTipoVotos\tCodigoTelegrama\tLista\tLista2\tVotos\n";
  writeStream.write(headerRow);

  files.forEach(file => {
    const filePath = path.join(__dirname, folderPath, file);
    try {
      const jsonData = require(filePath);

      // Lista de votos positivos e información extra
      const eleccionId = jsonData.id.eleccionId;
      const idMesa = jsonData.id.idAmbito.codigo;
      const totalElectores = jsonData.census;
      const electoresEscrutados = jsonData.pollingCensus;
      const codigoTelegrma = jsonData.partidos[0].codTel;
      const listaName = jsonData.partidos[0].name;
      const listaNombre = jsonData.partidos[0].listas;
      //-------------------------------------------------------

      const nulos = jsonData.nulos;
      const blancos = jsonData.blancos;
      const recuridos = jsonData.recurridos;
      const impugnado = jsonData.impugnados;
      const comando = jsonData.comando;
      
      // Procesar votos positivos
      for (let i = 0; i < listaNombre.length; i++) {
        const listaActual = listaNombre[i];
        const listaNombres = listaActual.nombre || '';
        const listaVotos = listaActual.votos;
        
        const rowData = `${eleccionId}\t${idMesa}\t${totalElectores}\t${electoresEscrutados}\tPositivo\t${codigoTelegrma}\t${listaName}\t${listaNombres}\t${listaVotos}\n`;
        writeStream.write(rowData);
      }

      // Procesar otros tipos de votos
      const tiposVotos = [
        { tipo: 'Nulos', votos: nulos },
        { tipo: 'Blancos', votos: blancos },
        { tipo: 'Recurridos', votos: recuridos },
        { tipo: 'Impugnados', votos: impugnado },
        { tipo: 'Comando', votos: comando }
      ];
      
      tiposVotos.forEach(tipoVoto => {
        const votosTipo = tipoVoto.votos;
        const rowData = `${eleccionId}\t${idMesa}\t${totalElectores}\t${electoresEscrutados}\t${tipoVoto.tipo}\t${codigoTelegrma}\t\t\t${votosTipo}\n`;
        writeStream.write(rowData);
      });

      console.log(`Archivo resultados.txt creado exitosamente para ${file}`);

    } catch (error) {
      console.error(`Error al procesar el archivo ${file}:`, error);
    }
  });

  writeStream.end();
  console.log('Proceso completo.');
});
