const yup = require('yup');

const objectId = yup
    .string()
    .required('ID is required.')
    .trim()
    .matches(/^[0-9a-fA-F]{24}$/, 'Invalid ID format.');

const optionalObjectId = yup
    .string()
    .trim()
    .matches(/^[0-9a-fA-F]{24}$/, 'Invalid ID format.')
    .nullable();

const dateString = yup
    .date()
    .typeError('A valid date is required.');

const validateAgainstSchema = async (schema, payload, location = 'body') => {
    try {
        const validated = await schema.validate(payload, {
            abortEarly: false,
            stripUnknown: false,
            context: { location },
        });

        return validated;
    } catch (error) {
        if (error instanceof yup.ValidationError) {
            const [firstError] = error.errors;
            const validationError = new Error(firstError);
            validationError.statusCode = 400;
            validationError.details = error.inner.map((item) => ({
                path: item.path,
                message: item.message,
            }));
            throw validationError;
        }

        throw error;
    }
};

const validateBody = (schema) => async (req, res, next) => {
    try {
        req.body = await validateAgainstSchema(schema, req.body, 'body');
        next();
    } catch (error) {
        res.status(error.statusCode || 500).json({
            error: error.message || 'Validation failed.',
            details: error.details || undefined,
        });
    }
};

const validateQuery = (schema) => async (req, res, next) => {
    try {
        req.query = await validateAgainstSchema(schema, req.query, 'query');
        next();
    } catch (error) {
        res.status(error.statusCode || 500).json({
            error: error.message || 'Validation failed.',
            details: error.details || undefined,
        });
    }
};

const validateParams = (schema) => async (req, res, next) => {
    try {
        req.params = await validateAgainstSchema(schema, req.params, 'params');
        next();
    } catch (error) {
        res.status(error.statusCode || 500).json({
            error: error.message || 'Validation failed.',
            details: error.details || undefined,
        });
    }
};

module.exports = {
    objectId,
    optionalObjectId,
    dateString,
    validateBody,
    validateQuery,
    validateParams,
};