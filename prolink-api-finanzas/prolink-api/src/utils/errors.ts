/** Error operacional con codigo HTTP; el resto se trata como 500 sin filtrar detalles. */
export class AppError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message);
  }
}
