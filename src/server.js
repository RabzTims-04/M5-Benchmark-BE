import express from "express"
import listEndpoints from "express-list-endpoints"
import cors from "cors"


const PORT = process.env.PORT
const server = express()

const whiteList = [
    process.env.FRONTEND_URL
]

/* ************MIDDLEWARES***************** */

server.use(express.json())
server.use(cors({
    origin:(origin, callback) =>{
        if(!origin || whiteList.indexOf(origin) !== -1){
            callback(null, true)
        }
        else{
            callback(new Error('not allowed by cors'))
        }
    }
}))

/* ************ENDPOINTS******************* */

/* ***********ERROR MIDDLEWARES************ */

console.table(listEndpoints(server));
server.listen(PORT, () => {
  console.log("🧡 server is running on port: " + PORT);
});

server.on("error", (error) =>
  console.log("💔 Server is not running due to 🛠", error)
);