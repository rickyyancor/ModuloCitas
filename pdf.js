PDFDocument = require('pdfkit');
doc = new PDFDocument
fs = require('fs');
doc.pipe(fs.createWriteStream('html/Reportes/output.pdf'))
doc.moveDown();
doc.text("Este texto no se en donde va a salir");
doc.end()
