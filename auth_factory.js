
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

async function getUserData() {

    const auth = new AuthUser()

    const options = {
        method: 'get',
        credentials: 'include',
        mode: 'cors',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': auth.getCookie('csrf_access_token'),
        },
    };

    console.log("Accessing protected route with cookies starting...")
    const endpoint = 'api/v1/admin/user'; //'protected';
   try {
    const response = await auth.makeRequest(options, endpoint)
   } catch (error) {
    throw new Error("Error to get the user data! "+ error);
   }
    console.log("Response...")
    console.log(response)

    if (!response.ok && !response.status_code) {
        const message = await auth.handlingErrors(response)
        console.log(message)
        setTimeout(() => {
            window.location.href = auth.baseURL + '/login.html'
        }, 1000)
        return;
    } else {
        if (response.status_code === 200) {
            localStorage.setItem('user_id', response.id)
            localStorage.setItem('username', response.username)
            localStorage.setItem('fullname', response.full_name)
            //localStorage.setItem('is_administrator', response.is_administrator)

            console.log("Accessed protected successfully!")
        } else if (response.status_code === 401 || response.status_code === 422) {
            alert("Ups! Something went wrong. Redirecting to login...")
            setTimeout(() => {
                window.location.href = auth.baseURL + '/login.html'
            }, 1000)
            return;
        } else {

        }

    }
    console.log('Process  finished!')

}


async function logout(e) {
    localStorage.clear()
    const auth = new AuthUser();
    
    const options = {
        method: 'get',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': auth.getCookie('csrf_access_token'),
        },
    };
    console.log("Logout process with cookies tarting...")
    const endpoint = 'api/v1/auth/logout';
    const response = await auth.makeRequest(options, endpoint)
    //console.log(response)
    if (!response.ok) {
        const message = await auth.handlingErrors(response)
        console.log(message)
        console.error("Logout process failed!")
    } else {
        console.log("Logout process done successfully!")
    }
    setTimeout(() => {
        console.log("Accessing login page...")
        window.location.href = auth.baseURL + '/login.html'
    }, 400)
    console.log('Process  finished!')
}

