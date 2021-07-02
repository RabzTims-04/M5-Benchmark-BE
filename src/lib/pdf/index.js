import PdfPrinter from "pdfmake"

export const generatePDFReadableStream = (title,img,data1,data2) => {
    
    const fonts = {
        Roboto:{
            normal: "Helvetica",
            bold:"Helvetica-bold",
            italics: "Helvetica-Oblique",
            bolditalics: "Helvetica-Oblique"
        },
        hello:{
            normal:"src/lib/fonts/hello.ttf"
        },
        MidnightInOctober:{
            normal:"src/lib/fonts/Midnight in October - TTF.ttf"
        }
    }

    const printer = new PdfPrinter(fonts)

    const docDefinition = {
        content:[          
             
            
                {
                    text:title,
                    fontSize: 24,
                    font:"MidnightInOctober",
                    margin:[0,10,0,10]
                },
                
                {
                    text:data1,
                    fontSize: 24,
                    font:"hello",
                    alignment:"right",
                    absolutePosition: {x: 0, y:55}
                },

                {
                    image:img,
                    width:500,
                    margin:[0,10,0,10]
                },
            
                 {
                   text:data2[0].comment,
                   alignment:'center',
                   fontSize: 20,
                   font:"hello", 
                 },
                 {
                    text:data2[0].rate,
                    alignment:'center',
                    fontSize: 20,
                    font:"hello", 
                  },
                  {
                    text:data2[1].comment,
                    alignment:'center',
                    fontSize: 20,
                    font:"hello",
                  },
                  {
                     text:data2[1].rate,
                     alignment:'center',
                     fontSize: 20,
                     font:"hello", 
                   },
                   {
                    text:data2[2].comment,
                    alignment:'center',
                    fontSize: 20,
                    font:"hello",
                  },
                  {
                     text:data2[2].rate,
                     alignment:'center',
                     fontSize: 20,
                     font:"hello",  
                   }
            
        ]
    }

    const pdfReadableStream = printer.createPdfKitDocument(docDefinition)
    pdfReadableStream.end()
    return pdfReadableStream
}