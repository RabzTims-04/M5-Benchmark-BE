import express from "express"
import uniqid from "uniqid"
import createError from "http-errors"
import multer from "multer"
import { v2 as cloudinary } from "cloudinary"
import { CloudinaryStorage } from "multer-storage-cloudinary"
import { validationResult } from "express-validator"
import { getMedias, writeMedias } from "../../lib/fs-tools.js"

const mediasRouter = express.Router()

/* *****************SEARCH****************** */

/* *****************GET medias************** */

mediasRouter.get("/", async (req, res, next)=>{
    try {
        const medias = await getMedias()
        res.send(medias)
        
    } catch (error) {
        next(error)
    }
})

/* **********GET single media*************** */

mediasRouter.get("/:id", async (req, res, next)=>{
    try {
        const medias = await getMedias()
        const media = medias.find(media => media._id === req.params.id)
        if(media){

            res.send(media)
        }
        else{
            next(createError(404,`media with id : ${req.params.id} not found`))
        }
        
    } catch (error) {
        next(error)
    }
})

/* **********POST on media****************** */

mediasRouter.post("/", async (req, res, next)=>{
    try {
        const newMedia = {
            ...req.body,
            _id:uniqid(),
            reviews:[],
            createdAt: new Date()
        }
        const medias = await getMedias()
        medias.push(newMedia)
        await writeMedias(medias)
        res.status(201).send({_id: newMedia._id})

        
    } catch (error) {
        next(error)
    }
})

/* *****************PUT Media*************** */

mediasRouter.put("/:id", async (req, res, next)=>{
    try {
        const medias = await getMedias()
        const mediaIndex = medias.findIndex(med => med._id === req.params.id)
        if(mediaIndex !== -1){
            let media = medias[mediaIndex]
            media = {
                ...media,
                ...req.body,
                _id: req.params.id,
                updatedAt: new Date()
            }
            medias[mediaIndex] = media
            await writeMedias(medias)
            res.send(media)
        }
        else{
            next(createError(400, {errorsList: errors}))
        }
        
    } catch (error) {
        next(error)
    }
})

/* *****************Delete media************ */

mediasRouter.delete("/:id", async (req, res, next)=>{
    try {
        const medias = await getMedias()
        const remainingMedias = medias.filter(med => med._id !== req.params.id)
        await writeMedias(remainingMedias)
        res.status(200).send(`media with id: ${req.params.id} is deleted successfully`)
        
    } catch (error) {
        next(error)
    }
})

/* *****************PDF upload************** */

/* *****************Cover upload************ */

/* *****************GET Reviews************* */

/* ***********GET single review************* */

/* *****************POST review************* */

/* **************DELETE review************** */



export default mediasRouter