/*
 * MIT License
 *
 * Copyright (c) 2022 Code4 v2 Technologies.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NON INFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import React, {Component} from 'react';
import UserService from '../service/user.service';
import sha256 from 'crypto-js/sha256';

/* creating the user context with defaultValue. */
const UserContext = React.createContext({
    currentUser: null,
    authenticateUser: () => {
    },
    logOutUser: () => {
    }
});

class UserProvider extends Component {

    constructor(props) {
        super(props);
        this.state = {
            currentUser: null, // initial currentUser is null because no user is logged in.
            authenticateUser: this._authenticateUser.bind(this),
            addUser: this._addUser.bind(this), // this will not be very much useful, though...
            logOutUser: this._removeUser.bind(this)
        };
    }

    async componentDidMount() {
        // const userIdValue = sessionStorage.getItem(sha256(process.env.REACT_APP_AUTHENTICATED_USER_ID));
        // const userNameValue = sessionStorage.getItem(sha256(process.env.REACT_APP_AUTHENTICATED_USER_NAME));
        // const userTypeValue = sessionStorage.getItem(sha256(process.env.REACT_APP_AUTHENTICATED_USER_TYPE));
        const userIdValue = 'MQ==' // 1
        const userNameValue = 'TWVudXJh' // Menura
        const userTypeValue = 'QURNSU4=' // ADMIN
        if (userIdValue && userNameValue && userTypeValue) {
            this.setState({
                currentUser: {
                    _id: atob(userIdValue),
                    name: atob(userNameValue),
                    type: atob(userTypeValue)
                }
            });
            /** Save current logged in user ID in the session storage. */
            sessionStorage.setItem(sha256(process.env.REACT_APP_AUTHENTICATED_USER_ID),
                btoa(atob(userIdValue)));
            /** Save current logged in user Name in the session storage. */
            sessionStorage.setItem(sha256(process.env.REACT_APP_AUTHENTICATED_USER_NAME),
                btoa(atob(userNameValue)));
            /** Save current logged in user TYPE in the session storage. */
            sessionStorage.setItem(sha256(process.env.REACT_APP_AUTHENTICATED_USER_TYPE),
                btoa(atob(userTypeValue)));

        }
    }

    /** Authenticate the user.
     * @return Promise with result. if success return boolean true.
     * otherwise reject error. */
    _authenticateUser({userID, password}) {
        const credentials = {
            userID: userID,
            password: password
        };
        console.log('credentials: ', credentials);
        return new Promise(async (resolve, reject) => {
            try {
                const jwtToken = await UserService.authenticate(credentials);
                if (jwtToken) {
                    console.log(`JSON Web Token: ${jwtToken}`);
                    if (await this.setUserToCurrentUser(credentials.userID)) {
                        resolve(true);
                    }
                }
            } catch (error) {
                reject(error);
            }
        });
    }

    setUserToCurrentUser(userID) {
        return new Promise(async (resolve, reject) => {
            try {
                const authUser = await UserService.getUserByID(userID);
                console.log(`authUser: ${authUser?._id}`);
                /** Save current logged in user ID in the session storage. */
                sessionStorage.setItem(sha256(process.env.REACT_APP_AUTHENTICATED_USER_ID),
                    btoa(authUser?._id));
                /** Save current logged in user Name in the session storage. */
                sessionStorage.setItem(sha256(process.env.REACT_APP_AUTHENTICATED_USER_NAME),
                    btoa(authUser?.name));
                /** Save current logged in user TYPE in the session storage. */
                sessionStorage.setItem(sha256(process.env.REACT_APP_AUTHENTICATED_USER_TYPE),
                    btoa(authUser?.type));
                this._addUser(authUser);
                resolve(true);
            } catch (error) {
                reject(error);
            }
        });
    }

    _addUser(user) {
        this.setState({
            currentUser: user
        });
    }

    _removeUser() {
        sessionStorage.removeItem(sha256(process.env.REACT_APP_JWT_TOKEN_NAME));
        sessionStorage.removeItem(sha256(process.env.REACT_APP_AUTHENTICATED_USER_ID));
        sessionStorage.removeItem(sha256(process.env.REACT_APP_AUTHENTICATED_USER_NAME));
        sessionStorage.removeItem(sha256(process.env.REACT_APP_AUTHENTICATED_USER_TYPE));
        this.setState({
            currentUser: null
        });
    }

    render() {
        return (
            <UserContext.Provider
                value={
                    {
                        ...this.state,
                    }
                }
            >
                {this.props.children}
            </UserContext.Provider>
        );
    }
}

const UserConsumer = UserContext.Consumer;
module.exports = {
    UserContext, UserProvider, UserConsumer
};
