
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
        let response = null;

        try {
            response = await fetch(`${this.serverDomain}/${endpoint}`, options);
            return await response.json();
        } catch (error) {
            console.error("Request failed:", error);
            console.error("Failed to connect to the server. Please try again later.");
            return response;
        }
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
                400: response.error || 'Bad Request.',
                401: response.error || 'Unauthorized.',
                404: response.error || 'Not Found.',
                415: response.error || 'Unsupported Media Type.',
                422: response.error || 'Unprocessable Entity.',
                423: response.error || 'Locked.',
                500: response.error || 'Internal Server Error.'
            };

            return errorMessages[response.status_code] || `HTTP error! status: ${response}`;
        }
    };

    async getErrorsSuccessMessage(message = 'Message', status_code) {
        if (status_code) {
            const errorMessages = {
                200: message,
                201: message,
                400: 'Bad Request. ' + message,
                401: message,
                404: message,
                415: 'Unsupported Media Type. ' + message,
                422: 'Unprocessable Entity. ' + message,
                423: 'Locked. ' + message,
                500: 'Internal Server Error. ' + message
            };
            return errorMessages[status_code] || `HTTP error! status: ${status_code}`;
        }
    };

    async handlingFieldErrors(response) {

        if (response.message.username) {
            return response.message.username;
        } else if (response.message.email) {
            return response.message.email;
        } else if (response.message.password) {
            return response.message.password;
        } else if (response.message.firstName) {
            return response.message.firstName;
        } else if (response.message.lastName) {
            return response.message.lastName;
        } else if (response.message.country) {
            return response.message.country;
        } else if (response.message.country_tel_code) {
            return response.message.country_tel_code;
        } else if (response.message.phoneNumber) {
            return response.message.phoneNumber;
        }

        return null;
    }
};

async function getUserData() {

    let response = null;
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
        response = await auth.makeRequest(options, endpoint)
    } catch (error) {
        throw new Error("Error to get the user data! " + error);
    }
    //console.log("Response...")
    //console.log(response)

    if (!response.ok && !response.status_code) {

        localStorage.clear()

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
            localStorage.setItem('typeOfUser', response.claims.type_of_user)
            localStorage.setItem('isAdminUser', response.claims.is_administrator)
            localStorage.setItem('isCeoUser', response.claims.is_ceo_user)
            localStorage.setItem("pageRefreshed", "false");

            window.dispatchEvent(new Event('userDataLoaded'))

            console.log("Accessed protected successfully!")
            return true;
        } else if (response.status_code === 401 || response.status_code === 422) {
            localStorage.clear()
            alert("Ups! Something went wrong. Redirecting to login...")
            setTimeout(() => {
                window.location.href = auth.baseURL + '/login.html'
            }, 1000)
            return false;
        }

    }
    console.log('Process  finished!')
    return false;
}


async function logout(e) {
    localStorage.clear()
    const auth = new AuthUser();
    let response = null;
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
    response = await auth.makeRequest(options, endpoint)
    //console.log(response)
    if (!response.ok) {
        const message = await auth.handlingErrors(response)
        if (message.logout || message.msg) {
            console.info(message.logout + ". " + message.msg)
        }

        console.error("Logout process failed!")
    } else {
        console.log("Logout process done successfully!")
    }
    setTimeout(() => {
        console.log("Accessing login page...")
        window.location.href = auth.baseURL + '/login.html'
    }, 400)
    console.log('Process  finished!')
};

async function filterDataFormLevel1(value, key, alertObject) {
    // Prevent SQL Injection - Allow only letters, numbers, and underscores
    const sqlInjectionPattern = /^[a-zA-Z0-9_@.+ ]+$/;
    if (key !== 'password' && key !== 'confirmPassword') {
        if (!sqlInjectionPattern.test(value)) { // Check if the value has only letters, numbers, and underscores
            alertObject.textContent = `Invalid ${key.replace('_', ' ')}! Use only letters, numbers, and underscores.`;
            return false;
        }
    }
    return true;
}

window.addEventListener('userDataLoaded', () => {
    const username = localStorage.getItem("username");
    const hasRefreshed = sessionStorage.getItem("pageRefreshed");

    if (username && !hasRefreshed) {
        //sessionStorage.setItem("pageRefreshed", "true");
        //location.reload();
    }
})



async function send_email_for_confirmation(dataForm) {
    const auth = new AuthUser();

    const options = {
        method: 'post',
        body: JSON.stringify(dataForm),
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': auth.getCookie('csrf_access_token'),
        },
    };
    console.log("Send email starting...")
    //const response = await auth.login(options)
    return await auth.makeRequest(options, 'api/v1/email/send-confirm-to-new-user')
}