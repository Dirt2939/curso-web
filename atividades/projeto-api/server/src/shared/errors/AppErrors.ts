class AppError {
  constructor(
      public readonly statusCode: number = 400,
      public readonly message: string,
  ) {}
}

export default AppError;
