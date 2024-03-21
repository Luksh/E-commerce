const validateReqBody = (validation) => {
  return async (req, res, next) => {
    try {
      const validatedData = await validation.validate(req.body);
      req.body = validatedData;
    } catch (error) {
      return res.status(400).send({ message: error.message });
    }
    next();
  };
};

export default validateReqBody;
