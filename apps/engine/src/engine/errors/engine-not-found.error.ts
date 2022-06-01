export class EngineNotFound extends Error {
  constructor(m: string) {
    super(m);

    // Set the prototype explicitly.
    Object.setPrototypeOf(this, EngineNotFound.prototype);
  }
}