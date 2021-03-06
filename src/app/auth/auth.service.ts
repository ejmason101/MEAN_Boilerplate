import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Router } from "@angular/router";

import { AuthData } from "./auth-data.model";
import { LoginData } from "./login-data.model";
import { Subject, Subscribable, Subscription } from "rxjs";
import { map } from 'rxjs/operators'

import { User } from "./user.model";

import { environment } from "../../environments/environment";

// For the ptoast message response
import { Message } from "primeng/api"



const BACKEND_URL = environment.apiUrl + '/user'

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    /*
        This is wehre other properties of a user can be defined
        // TODO bring in 

    */
    private token: string;
    private isAuthenticated = false;
    // private tokenTimer: NodeJS.Timer; // change to any if it complaigns
    private tokenTimer: any; // change to any if it complaigns


    // User variable that stores the logged in user data 
    // so it can be accessable from the 
    private user: User;

    // use subject to push auth info to compoinents that are interested
    private authStatusListener = new Subject<boolean>(); // is the user authed or not

    // Add listener for any errors from calls 
    private pMessageUpdateListener = new Subject<Message>();

    constructor(private http: HttpClient,
                private router: Router) { }


    getUserInfo(userId: string ) {
        console.log('Getting Info on user with id: ' + userId);
        if(userId == null){
            return;
        }
        this.http
            .get<{severity: string, summary: string, detail: string, userFullName: string}>(BACKEND_URL + "/getInfo/" + userId)
            .subscribe(ret => {
                console.log('User info return');
                console.log(ret);
                return ret.userFullName;
            });
    } 

    getLocalUserVar() {
        if (!this.user) {
            console.log("auther.service.getLocalUserVar() error --> cant return getLocalUserVar() for null this.user!");
            return null;
        } else {
            console.log("auth.service.getLocalUserVar()--> returning local this.user variable...");
            return this.user;
        }
    }

    getUserId() {
        console.log('getUserID() :');
        console.log(this.user);
        if (!this.user) {
            // no user logged in presently
            return null;
        } else {
            return this.user.id;
        }
    }

    getUserFullName() {
        console.log('getUserFullName()');
        if (!this.user) {
            return null; // no user logged in?
        } else {
            const fullName = this.user.firstname + ' ' + this.user.lastname;
            console.log(fullName);
            return fullName;
        }


    }

    getUserLevel() {
        console.log('getUserLevel() :');
        console.log(this.user);
        if (!this.user) {
            // no user logged in presently
            return "default";
        } else {
            return this.user.userLevel;
        }
    }

    getAuthStatusListener() {
        return this.authStatusListener.asObservable();
    }

    getPMessageUpdateListener() {
        return this.pMessageUpdateListener.asObservable();
    }

    getIsAuth() {
        return this.isAuthenticated;
    }

    getToken() {
        return this.token;
    }

    createUser(
        // what is expected from the form
        firstname: string,
        lastname: string,
        email: string,
        password: string,
        studentID: string,
        phone: string,
        userLevel: string) {

        const authData: AuthData = {
            firstname: firstname,
            lastname: lastname,
            email: email,
            password: password,
            studentID: studentID,
            phone: phone,
            userLevel: userLevel
        }

        console.log("Sending this authData to server to create new user: ");
        console.log(authData);

        // send request
        this.http
            .post<{ message: string }>(
                BACKEND_URL + "/signup",
                authData)
            .subscribe((results) => {
                console.log('create user successful');
                console.log(results);
                this.router.navigate(['/']);
            }, err => {
                console.log('create user unsuccessful')
                this.authStatusListener.next(false);
            });
    } // end create user

    loginUser(email: string, password: string) {

        console.log('trying to log user in using BACKEND_URL: ');
        console.log(BACKEND_URL);
        const authData: LoginData = {
            email: email,
            password: password
        };

        console.log(authData);


        this.http
            .post<{ token: string, expiresIn: number, message: string, loggedInUser: User }>(
                BACKEND_URL + '/login',
                authData
            )
            .subscribe(response => {
                console.log('Auth service loginUser()');
                console.log(response); // token recieved from successful login
                const token = response.token;
                this.token = token;
                if (token) {
                    const expiresInDuration = response.expiresIn;
                    console.log('token ttl: ' + expiresInDuration);
                    this.isAuthenticated = true;
                    console.log('userLevel:' + response.loggedInUser.userLevel);

                    this.user = response.loggedInUser;

                    this.authStatusListener.next(true); // inform everyone

                    // sets token timer
                    this.setAuthTimer(expiresInDuration);

                    // saves AuthData to local storage
                    const now = new Date();
                    const expirationDate = new Date(now.getTime() + expiresInDuration * 1000);
                    this.saveAuthData(token, expirationDate, this.user);

                    // Navigate to root page of app
                    this.router.navigate(['/']);
                    // TODO return on navigate callback
                    return true;
                }
            }, error => {
                console.log('Error from http login post call: ');
                console.log(error)
                this.authStatusListener.next(false);

                this.pMessageUpdateListener.next({
                    severity: 'error',
                    summary: 'Login Failed!',
                    detail: error.error.message
                });
                return error;
            });
            
        } // end loginUser call

    // tries to auth user using local storage
    autoAuthUser() {
        const authInformation = this.getAuthData();
        if (!authInformation) {
            // no stored info
            return;
        }

        // check if the token is still valid
        const now = new Date();
        console.log("Current Date() at autoAuth: ");
        console.log(now);
        const expiresIn = authInformation.expirationDate.getTime() - now.getTime();
        // check if date is in the FuTuRe
        console.log("autoAuthUser()");
        console.log(authInformation, expiresIn);

        if (expiresIn > 0) {
            this.token = authInformation.token;
            this.isAuthenticated = true;
            this.user = authInformation.user;
            this.setAuthTimer(expiresIn / 1000);
            this.authStatusListener.next(true); // tell everyone auth is successful

        }
    }

    logout() {
        this.token = null;
        this.isAuthenticated = false;
        // update all intresed items
        this.authStatusListener.next(false);
        // redirect to homepage

        // clears token timer when logged out manually
        clearTimeout(this.tokenTimer);
        this.clearAuthData();
        this.user.id = null;
        this.router.navigate(['/']);
    }

    // to save token to browser localStorage to presist data
    private saveAuthData(token: string, expirationDate: Date, user: User) {
        localStorage.setItem('token', token);
        localStorage.setItem('expiration', expirationDate.toISOString());
        localStorage.setItem('user', JSON.stringify(user));

    }

    private clearAuthData() {
        localStorage.removeItem('token');
        localStorage.removeItem('expiration');
        localStorage.removeItem('user');
    }

    private getAuthData() {
        const token = localStorage.getItem('token');
        const expirationDate = localStorage.getItem('expiration');
        const user = JSON.parse(localStorage.getItem('user'));
        if (!token || !expirationDate) {
            return;
        }
        // if ;they exist
        return {
            token: token,
            expirationDate: new Date(expirationDate),
            user: user
        }
    }

    private setAuthTimer(duration: number) {
        console.log('Setting time: ' + duration);

        this.tokenTimer = setTimeout(() => {
            // clear token when it expires
            this.logout();
        }, duration * 1000);
    }
}