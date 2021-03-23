import {BehaviorSubject, Observable, ReplaySubject} from "rxjs";
import {map, tap} from "rxjs/operators";
import {ErrorService} from "@/domain/ErrorService";
import {LoginRequestData} from "@/api/User/LoginRequestData";
import {LoginResult} from "@/api/User/LoginResult";
import {UserApi} from "@/api/User/UserApi";
import {UserData} from "@/domain/User/UserData";

export class UserService {

    private tokenSnapshot: string | undefined = undefined;
    private token$ = new ReplaySubject<string>(1);

    private isLoggedInSnapshot = false;
    private isLoggedIn$ = new ReplaySubject<boolean>(1);

    private userDataSnapshot: UserData | undefined = undefined;
    private userData$ = new ReplaySubject<UserData>(1);

    constructor(
        private errorService: ErrorService,
        private userApi: UserApi
    ) {
        this.autoLoginIfPossible();
    }

    private autoLoginIfPossible() {
        const token = localStorage.getItem("token");
        if (token != null) {
            console.log("found token in local storage.. performing auto-login..");
            this.autoLoginByToken(token);
        } else {
            this.isLoggedInSnapshot = false;
            this.isLoggedIn$.next(false);
        }
    }

    private autoLoginByToken(token: string) {
        this.userApi.retrieveUserDataByToken(token)
            .toPromise()
            .then(userData => {
                console.log("userData loaded by token:");
                console.log(userData);
                this.userDataSnapshot = userData;
                this.userData$.next(userData);
                this.isLoggedInSnapshot = userData != undefined;
                this.isLoggedIn$.next(userData != undefined);

                /*
                this.$store.commit("setUser", response.data);

                this.$http
                    .get(
                        this.$store.state.api +
                        "/user/" +
                        response.data._id +
                        "/namespaces",
                        this.$store.getters.getAuthorizationHeader
                    )
                    .then((response) => {
                        this.$store.commit("setUserNamespaces", response.data);
                    })
                    .catch((error) => {
                        console.log(error);
                    });

                if (response.data.level >= 1000) {
                    this.$http
                        .get(
                            this.$store.state.api + "/user",
                            this.$store.getters.getAuthorizationHeader
                        )
                        .then((response) => {
                            this.$store.commit(
                                "setUsers",
                                response.data.filter((u: { email: string; }) => u.email !== "admin")
                            );
                        })
                        .catch((error) => {
                            console.log(error);
                        });
                }

                this.$http
                    .get(
                        this.$store.state.api + "/group",
                        this.$store.getters.getAuthorizationHeader
                    )
                    .then((response) => {
                        this.$store.commit("setGroups", response.data);
                    })
                    .catch((error) => {
                        console.log(error);
                    });

                this.$http
                    .post(
                        this.$store.state.api + "/job/search",
                        {
                            filter: [],
                        },
                        this.$store.getters.getAuthorizationHeader
                    )
                    .then((response) => {
                        this.$store.commit(
                            "setJobs",
                            response.data.map((job: { tileURL: string; _id: string; slider: number; }) => {
                                job.tileURL =
                                    this.$store.state.api + "/stream/thumbnail/" + job._id;
                                job.slider = 0;
                                return job;
                            })
                        );
                    })
                    .catch((error) => {
                        console.log(error);
                    });

                this.$http
                    .get(
                        this.$store.state.api + "/preference",
                        this.$store.getters.getAuthorizationHeader
                    )
                    .then((response) => {
                        this.$store.commit(
                            "setPreferences",
                            response.data.sort((a: { key: number; }, b: { key: number; }) => {
                                return a.key > b.key;
                            })
                        );
                    })
                    .catch((error) => {
                        console.log(error);
                    });

                if (!Vue.prototype.$socket) {
                    Vue.prototype.$connect(
                        this.$store.state.websocketUrl +
                        "?token=" +
                        localStorage.getItem("jwt")
                    );
                }
                 */
            }).catch(error => {
            this.isLoggedInSnapshot = false;
            this.isLoggedIn$.next(false);
        });
    }

    public login(loginRequestData: LoginRequestData, keepLoggedIn: boolean): Observable<LoginResult> {
        return this.userApi.login(loginRequestData).pipe(
            tap(loginResult => {
                if (loginResult.isAuthorized) {
                    this.isLoggedInSnapshot = true;
                    this.isLoggedIn$.next(loginResult.isAuthorized);
                }
                if (loginResult.userData) {
                    this.userDataSnapshot = loginResult.userData;
                    this.userData$.next(loginResult.userData);
                }
                if (loginResult.token) {

                    this.tokenSnapshot = loginResult.token;
                    this.token$.next(loginResult.token);
                    console.log("token:");
                    console.log(loginResult.token);

                    // this.autoLoginByToken(loginResult.token);
                }
                if (keepLoggedIn && loginResult.token) {
                    localStorage.setItem("tokenSnapshot", loginResult.token);
                }
            })
        );


        /*
this.$http
    .post(this.$store.state.api + "/login", payload)
    .then((response) => {


      this.$http
          .get(this.$store.state.api + "/whoami", this.$store.getters.getAuthorizationHeader)
          .then((response) => {
            var user = response.data;
            if (user.activeNamespace && user.activeNamespace.length) {
              this.$store.commit("setUser", user);

              if (!Vue.prototype.$socket) {
                Vue.prototype.$connect(
                    this.$store.state.websocketUrl + "?token=" + localStorage.getItem("jwt")
                );
              }

              this.$updateObjects();

              this.$router.push({ name: "Dashboard" });
            } else {
              this.$store.commit("setSnackbar", {
                text: this.$t("view.login.noNamespaceFound"),
              });
            }
          });
    })
    .catch((err) => {
      if (
          err &&
          err.response &&
          err.response.data &&
          err.response.data.message &&
          err.response.data.message.toLowerCase().indexOf("totp") > -1
      ) {
        this.$store.commit("setAuthDialog", {
          visible: true,
          type: "twoFactorAuth",
          user: payload,
          callback: (code) => {
            this.login(code);
          },
        });
      } else {
        this.$store.commit("setSnackbar", {
          text: err.response.data.message,
          color: "var(--attention)",
        });
      }
    });*/
    }

    public getToken$(): Observable<string> {
        return this.token$.asObservable();
    }

    public getIsLoggedIn$(): Observable<boolean> {
        return this.isLoggedIn$.asObservable();
    }

    public getUserData$(): Observable<UserData> {
        return this.userData$.asObservable();
    }

    public logout(): void {
        localStorage.removeItem("tokenSnapshot");
        this.tokenSnapshot = undefined;
        this.userDataSnapshot = undefined;
        this.isLoggedInSnapshot = false;
        this.isLoggedIn$.next(false);
    }

    public listNamespacesByEmail(emailAddress: string): Observable<string[]> {
        return this.userApi.listNamespacesByEmail(emailAddress);
    }

    public sendPasswordResetEmail(emailAddress: string): Observable<void> {
        return this.userApi.sendPasswordResetEmail(emailAddress);
    }

    public recover2FactorAuthentication(secretRecoverKey: string): Observable<boolean> {
        return this.userApi.recover2FactorAuthentication(secretRecoverKey);
    }

}
