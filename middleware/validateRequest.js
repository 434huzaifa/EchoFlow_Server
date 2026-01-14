// Validation middleware factory to validate request body with Zod schema
const validateRequest = (schema) => {
  return (req, res, next) => {
    try {
      const validatedData = schema.parse(req.body);
      req.validatedData = validatedData;
      next();
    } catch (error) {
      if (error.errors && Array.isArray(error.errors)) {
        // Format Zod errors into humanoid messages
        const fieldErrors = error.errors.reduce((acc, err) => {
          const field = err.path.join('.');
          const message = err.message;
          acc[field] = message;
          return acc;
        }, {});

        return res.status(400).json({
          message: 'Validation failed. Please check your input.',
          errors: fieldErrors,
        });
      }

      return res.status(400).json({
        message: 'Invalid request data',
        details: error.message,
      });
    }
  };
};

export default validateRequest;
