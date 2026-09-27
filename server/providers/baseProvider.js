export class BaseGenerationProvider {
  async submit() {
    throw new Error('submit() must be implemented by the provider.');
  }

  async getStatus() {
    throw new Error('getStatus() must be implemented by the provider.');
  }

  async getResult() {
    throw new Error('getResult() must be implemented by the provider.');
  }

  async retry() {
    throw new Error('retry() must be implemented by the provider.');
  }
}
