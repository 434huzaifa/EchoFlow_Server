// Validation middleware factory to validate request body with Zod schema
import z, { ZodError } from "zod";

const validateRequest = (schema) => {
  return (req, res, next) => {
    try {
      if (process.env.NODE_ENV === 'development') {
        console.log("Validating request data:", req.body);
      }
      const validatedData = schema.parse(req.body);
      req.validatedData = validatedData;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          message: z.prettifyError(error),
        });
      }

      return res.status(400).json({
        message: "Invalid request data",
        details: error.message,
      });
    }
  };
};

export default validateRequest;
