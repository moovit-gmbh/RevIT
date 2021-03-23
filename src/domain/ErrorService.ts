import { Observable, Subject } from "rxjs";

/**
 * @see https://www.raymondcamden.com/2019/05/01/handling-errors-in-vuejs
 * @see https://medium.com/js-dojo/error-exception-handling-in-vue-js-application-6c26eeb6b3e4
 */
export class ErrorService {
  private error$: Subject<string> = new Subject<string>();

  public setError(message: string): void {
    this.error$.next(message);
  }

  public getErrorObservable(): Observable<string> {
    return this.error$.asObservable();
  }
}
