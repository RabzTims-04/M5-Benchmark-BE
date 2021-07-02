import express from "express"
import uniqid from "uniqid"
import createError from "http-errors"
import multer from "multer"
import { v2 as cloudinary } from "cloudinary"
import { CloudinaryStorage } from "multer-storage-cloudinary"
import { validationResult } from "express-validator"
import { getMedias, writeMedias } from "../../lib/fs-tools.js"
import { mediasValidation, mediaReviewsValidation, checkValidationResult } from "./validation.js"
import { generatePDFReadableStream } from "../../lib/pdf/index.js"
import { pipeline } from 'stream'
import axios from 'axios'
import {extname} from "path"

const mediasRouter = express.Router()

/* *****************SEARCH****************** */

mediasRouter.get("/search", async (req, res, next)=>{
    try {
        console.log(req.query);
        let Title = req.query.Title
        const medias = await getMedias()
        const filtered = medias.filter(media => media.Title.toLowerCase().includes(Title.toLowerCase()))
        res.send(filtered)        
    } catch (error) {
        next(error)
    }
})

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
        const media = medias.find(media => media._imdbID === req.params.id)
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

mediasRouter.post("/", mediasValidation, checkValidationResult, async (req, res, next)=>{
    try {
        const errors = validationResult(req)
        if(errors.isEmpty()){
        const newMedia = {
            ...req.body,
            _imdbID:uniqid(),
            reviews:[],
            createdAt: new Date()
        }
        const medias = await getMedias()
        medias.push(newMedia)
        await writeMedias(medias)
        res.status(201).send({_imdbID: newMedia._imdbID})

        
    } 
        else{
             next(createError(400, {errorsList: errors}))
            }
        }
    catch (error) {
        next(error)
    }
})

/* *****************PUT Media*************** */

mediasRouter.put("/:id", mediasValidation, checkValidationResult,async (req, res, next)=>{
    try {
        const medias = await getMedias()
        const mediaIndex = medias.findIndex(med => med._imdbID === req.params.id)
        if(mediaIndex !== -1){
            let media = medias[mediaIndex]
            media = {
                ...media,
                ...req.body,
                _imdbID: req.params.id,
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
        const remainingMedias = medias.filter(med => med._imdbID !== req.params.id)
        await writeMedias(remainingMedias)
        res.status(200).send(`media with id: ${req.params.id} is deleted successfully`)
        
    } catch (error) {
        next(error)
    }
})

/* *****************PDF upload************** */

mediasRouter.get("/:id/pdf", async (req, res, next) => {
    try {

        const medias = await getMedias()
        const media = medias.find(media => media._imdbID === req.params.id)
        res.setHeader("Content-Disposition","attachment; filename = media.pdf")
        if(media){
            const content = media.reviews
            const response = await axios.get(media.Poster,
                {responseType:'arraybuffer'}
                )
            const mediaCoverURLParts =  media.Poster.split('/')
            const fileName = mediaCoverURLParts[mediaCoverURLParts.length-1]
            const [id, extension] = fileName.split('.')
            const base64 = Buffer.from(response.data).toString('base64')
           /*  const base64 = response.data.toString("base64") */
            const base64Image = `data:image/${extension};base64,${base64}`

            const source = await generatePDFReadableStream(media.Title, base64Image, media.Year,content)
            const destination = res
            pipeline(source, destination, err => {
                if(err){
                    next(err)
                }
            })
        }   
        
    } catch (error) {
        next(error)
    }
})

/* **************************Cover upload************************ */

/******************* CLOUDINARY******************/

const cloudinaryStorage = new CloudinaryStorage({
        cloudinary,
        params:{
        folder:"medias"
        }
    })

const uploadOnCloudinary = multer({ storage: cloudinaryStorage}).single("mediaCover")

/******************* POST IMAGE******************/

mediasRouter.post("/:id/uploadCover", uploadOnCloudinary, async (req, res, next) => {
    try {
        const newMedia = {mediaCover: req.file.path}
        const url = newMedia.mediaCover
        const medias = await getMedias()
        const media = medias.find(media => media._imdbID === req.params.id)
        if(media){
            media.Poster = url
            await writeMedias(medias)
        }
        res.send(url)
        
    } catch (error) {
        next(error)
    }
})

/* *****************GET Reviews************* */

mediasRouter.get("/:id/reviews", async (req, res, next)=>{
    try {
        const medias = await getMedias()
        const media = medias.find(media => media._imdbID === req.params.id)
        if(media){
            const mediaReviews = media.reviews
            res.send(mediaReviews)
        }
        else{
            next(createError(404,`media with id : ${req.params.id} not found`))
        }
        
    } catch (error) {
        next(error)
    }
})

/* ***********GET single review************* */

mediasRouter.get("/:id/reviews/:revId", async (req, res, next)=>{
    try {
        const medias = await getMedias()
        const media = medias.find(media => media._imdbID === req.params.id)
        if(media){
            const mediaReviews = media.reviews
            if(mediaReviews){
                const singleReview = mediaReviews.find( rev => rev._id === req.params.revId)
                if(singleReview){

                    res.send(singleReview)
                }
                else{
                    next(createError(404,`review with id: ${req.params.revId} not found`))
                }
            }
        }
        else{
            next(createError(404,`media with id : ${req.params.id} not found`))
        }
        
    } catch (error) {
        next(error)
    }
})

/* *****************POST review************* */

mediasRouter.post("/:id/reviews",mediaReviewsValidation, checkValidationResult,async (req, res, next)=>{
    try {
        const errors = validationResult(req)
        if(errors.isEmpty()){       
        const medias = await getMedias()
        const media = medias.find(media => media._imdbID === req.params.id)
        let imdb = media._imdbID
        if(media){
            const mediaReviews = media.reviews
            const review = {
                ...req.body,
                _id:uniqid(),
                elementId:imdb,
                createdAt: new Date()
            }
             mediaReviews.push(review)
             await writeMedias(medias)
             res.status(201).send({_id: review._id})
        }
    }
        else{
            next(createError(404,{errorsList:errors}))
        }
        
    } catch (error) {
        next(error)
    }
})

/* *****************PUT review************* */

mediasRouter.put("/:id/reviews/:revId",mediaReviewsValidation, checkValidationResult, async (req, res, next)=>{
    try {
        const medias = await getMedias()
        const mediaIndex = medias.findIndex(media => media._imdbID === req.params.id)
        if(mediaIndex !== -1){
            let media = medias[mediaIndex]
            let mediaReviews = media.reviews
            let mediaReviewIndex = mediaReviews.findIndex( rev => rev._id === req.params.revId)
            let editReview = mediaReviews[mediaReviewIndex]
            editReview = {
                ...editReview,
                ...req.body,
                _id: req.params.revId,
                updatedAt: new Date()
            }
            console.log(editReview);

            mediaReviews[mediaReviewIndex] = editReview
            await writeMedias(medias)
            res.send(media)
        }
        else{
            next(createError(400, 'media not found'))
        }
        
    } catch (error) {
        next(error)
    }
})

/* **************DELETE review************** */

mediasRouter.delete("/:id/reviews/:revId", async (req, res, next)=>{
    try {
        const medias = await getMedias()
        const media = medias.find(media => media._imdbID === req.params.id)
        if(media){
            const mediaReviews = media.reviews
            const deleteReview = mediaReviews.findIndex(review => review._id === req.params.revId)
            res.send(mediaReviews[deleteReview])
            mediaReviews.splice(deleteReview,1)
            await writeMedias(medias)
            res.status(200)
        }
        else{
            next(createError(400,`error deleting review`))
        }
        
    } catch (error) {
        next(error)
    }
})



export default mediasRouter