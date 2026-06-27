const { body, validationResult } = require("express-validator");

const validationHandler = (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({
            message: "Validation failed",
            errors: errors.array()
        });
    }

    next();
};

exports.validateSignup = [
    body("username")
        .trim()
        .isLength({ min: 3, max: 30 })
        .withMessage("Username must be 3-30 characters"),

    body("email")
    .trim()
    .custom((email) => {
        if (!email.endsWith("@mvsrec.edu.in")) {
            throw new Error("Only college email addresses are allowed");
        }
        return true;
    }),

    body("password")
        .isLength({ min: 8 })
        .withMessage("Password must be at least 8 characters"),

    body("role")
        .optional()
        .isIn(["student", "teacher", "hod", "principal", "alumini"])
        .withMessage("Invalid role"),

    body("department")
        .isIn(["CSE", "ECE", "EEE", "ME", "CE", "IT", "Other"])
        .withMessage("Invalid department"),

    body("course")
        .isIn(["B.Tech", "M.Tech", "MBA", "MCA", "PhD", "Other"])
        .withMessage("Invalid course"),

    body("batch")
        .trim()
        .notEmpty()
        .withMessage("Batch is required"),

    validationHandler
];

exports.validateLogin = [
    body("email")
        .isEmail()
        .normalizeEmail(),

    body("password")
        .notEmpty(),

    validationHandler
];