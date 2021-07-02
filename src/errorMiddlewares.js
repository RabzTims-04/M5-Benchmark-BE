export const notFoundMiddleWare = (err, req, res, next)=>{
    if(err.status === 404){
        res.status(404).send({successful: false, message: err.message})
    }
    else{
        next(err)
    }
}

export const badRequestMiddleware = (err, req, res, next)=>{
    if(err.status === 400){
        res.status(400).send(err.errorsList)
    }
    else{
        next(err)
    }
}

export const catchAllErrors = (err, req, res, next)=>{
    res.status(500).send("Generic Server Error")
}