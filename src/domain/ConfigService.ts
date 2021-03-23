export class ConfigService {

  public getRestAPIURL(): string
  {
    if(process.env.VUE_APP_API === undefined) {
      throw new Error("Vue environment variable \"VUE_APP_API\" (missing in .env* file)!");
    }
    return process.env.VUE_APP_API;
  }

  public getWorkerRestAPIURL(): string
  {
    if(process.env.VUE_APP_UPLOAD_WORKER_API === undefined) {
      throw new Error("Vue environment variable \"VUE_APP_UPLOAD_WORKER_API\" (missing in .env* file)!");
    }
    return process.env.VUE_APP_UPLOAD_WORKER_API;
  }

}
