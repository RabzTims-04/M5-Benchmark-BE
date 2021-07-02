import { body, validationResult } from "express-validator";

export const mediasValidation = [

    body("Title").exists().withMessage("Title is mandatory").isString().withMessage("Title should be a string"),

    body("Year").exists().withMessage("Year is mandatory").isNumeric().withMessage("Year should be a numeric"),

    body("Type").exists().withMessage("Type is mandatory").isString().withMessage("Type should be a string"),

    body("Poster").exists().withMessage("Poster is mandatory")
   
]

export const mediaReviewsValidation =[

    body("comment").exists().withMessage('comment is mandatory').isString().withMessage("comment should be a string"),

    body("rate").exists().withMessage('rate Field is mandatory').isNumeric().withMessage("rate should be numeric")

]

export const checkValidationResult = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new Error("Media vlidation is failed");
      error.status = 400;
      next(error);
    }
    next();
  };
  