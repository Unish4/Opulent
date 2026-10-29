import type { RequestHandler } from "express";
import type { ZodType } from "zod";

interface Schemas {
  body?: ZodType;
  params?: ZodType;
  query?: ZodType;
}

export const validateRequest =
  (schemas: Schemas): RequestHandler =>
  (req, res, next) => {
    try {
      if (schemas.body) req.body = schemas.body.parse(req.body);
      if (schemas.params) schemas.params.parse(req.params);
      if (schemas.query) res.locals.query = schemas.query.parse(req.query);
      next();
    } catch (error) {
      next(error);
    }
  };
