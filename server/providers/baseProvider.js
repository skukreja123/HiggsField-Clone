export class BaseGenerationProvider {
  async submit(_payload) {
    throw new Error('submit() must be implemented by the provider.');
  }

  async getStatus(_generationId) {
    throw new Error('getStatus() must be implemented by the provider.');
  }

  async getResult(_generationId) {
    throw new Error('getResult() must be implemented by the provider.');
  }

  async retry(_generationId) {
    throw new Error('retry() must be implemented by the provider.');
  }
}
