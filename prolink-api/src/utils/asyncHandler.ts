import type { NextFunction, Request, Response } from 'express';

/** Encapsula handlers async para que los rechazos lleguen al middleware de errores. */
export const asyncHandler =
  (fn: (req: Request, res: Response) => Promise<unknown>) =>
  (req: Request, res: Response, next: NextFunction): void => {
    fn(req, res).catch(next);
  };
