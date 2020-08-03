export class ExampleError extends Error {
    constructor(message, metadata) {
      super(message);
      this.name = "ExampleError";
      this.metadata = metadata;
    }
  }