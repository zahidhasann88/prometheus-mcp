export class PromError extends Error {
  constructor(
    message: string,
    readonly httpStatus: number,
    readonly errorType?: string,
  ) {
    super(message);
    this.name = "PromError";
  }
}
