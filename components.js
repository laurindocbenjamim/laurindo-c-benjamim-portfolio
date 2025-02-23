
class AuthUser {
    constructor() {
        //this.baseURL = window.location.origin;
        this.baseURL = window.location.origin + '/laurindo-c-benjamim-portfolio';
        this.serverDomain = 'https://www.d-tuning.com';
        //this.serverDomain = 'http://localhost:5000';
    }
    async login(options) {
        const response = await fetch(`${this.serverDomain}/login-w-cookies`, options);
        return response.json();
    }

    async makeRequest(options, endpoint) {
        const response = await fetch(`${this.serverDomain}/${endpoint}`, options);
        return response.json();
    }

    async logout(options) {
        const response = fetch(`${this.serverDomain}/logout_with_cookies`, options);
        return response.json();
    }

    async getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
    }

    async getOptions2(method, formData) {
        if (!method || !formData) { return null; };

        const headers = {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': await this.getCookie('csrf_access_token'),
        };
        const options = {
            method: method,
            credentials: 'include',// method === 'GET' ? 'same-origin' : 'include',
            headers: headers,
        };
        if (method !== 'GET') {
            options.body = formData;
        }
        console.log(options)
        return options;
    };

    async getOptions(method, formData) {
        const csrfToken = await this.getCookie('csrf_access_token');
        const headers = {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': csrfToken,
        };
        return method === 'GET' ? {
            method: method,
            credentials: 'same-origin',
            headers: headers,
        } : {
            method: method,
            credentials: 'include',
            body: formData,
            headers: headers,
        };
    };
    async makeRequestWithJWT() {
        const options = {
            method: 'post',
            credentials: 'same-origin',
            headers: {
                'X-CSRF-TOKEN': await this.getCookie('csrf_access_token'),
            },
        };
        const response = await fetch(`${this.serverDomain}/protected`, options);
        const result = await response.json();
        return result;
    };

    async handlingErrors(response) {
        if (!response.ok) {
            const errorMessages = {
                400: 'Bad Request',
                401: 'Unauthorized',
                415: 'Unsupported Media Type',
                422: 'Unprocessable Entity',
                423: 'Locked',
                500: 'Internal Server Error'
            };
            console.log(response)
            return errorMessages[response.status] || `HTTP error! status: ${response}`;
        }
    };

    async getErrorsSuccessMessage(message = 'Message', status_code) {
        if (status_code) {
            const errorMessages = {
                200: message,
                400: 'Bad Request. ' + message,
                401: 'Unauthorized. ' + message,
                415: 'Unsupported Media Type. ' + message,
                422: 'Unprocessable Entity. ' + message,
                423: 'Locked. ' + message,
                500: 'Internal Server Error. ' + message
            };
            return errorMessages[status_code] || `HTTP error! status: ${status_code}`;
        }
    };
};



document.addEventListener('DOMContentLoaded', () => {
    const user_id = localStorage.getItem('user_id')
    const username = localStorage.getItem('username')
    const fullname = localStorage.getItem('fullname')
    const loginLink = document.querySelector('#login-link');
    const logoutLink = document.querySelector('#logout-link');

    if (user_id) {


        if (loginLink) {
            loginLink.style.display = 'none';
            if (logoutLink) {
                logoutLink.style.display = 'block';
            }
        } else {
            console.log("login-link not found");
        }

    } else {
        alert("Bad")
    }
})