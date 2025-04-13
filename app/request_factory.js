
export class RequestFactory {
    constructor() {
        this.baseURL = window.location.origin.includes('laurindocbenjamim.github.io')
            ? window.location.origin + '/laurindo-c-benjamim-portfolio'
            : window.location.origin;

        this.serverDomain = 'http://localhost:5000';

        if (this.baseURL.includes('.github.io') || this.baseURL.includes('laurindocbenjamim.pt')) {
            this.serverDomain = 'https://www.d-tuning.com';
        }
    }

    async makeRequest(options, endpoint) {
        let response = null;

        try {
            response = await fetch(`${this.serverDomain}/${endpoint}`, options);
            return await response.json();
        } catch (error) {
            console.error("Request failed:", error);
            console.error("Failed to connect to the server. Please try again later.");
            document.getElementById('spinnerBorder').style.display = 'none';
            document.getElementById('errorMessage').innerText = error;
            document.getElementById('successMessage').innerText = '';
            return response;
        }
    }

    async getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
    }

    async getCookie2(name) {
        const cookies = document.cookie.split(';');
        for (let cookie of cookies) {
            const [cookieName, cookieValue] = cookie.trim().split('=');
            if (cookieName === name) return cookieValue;
        }
        return null;
    }

    async createOptions(method, data = null, dataType = 'formData') {
        const options = {
            method: method.toUpperCase(),
            credentials: 'include',
            headers: {
                ...(dataType === 'formData' ? {} : { 'Content-Type': 'application/json' }),
                'X-CSRF-TOKEN': await this.getCookie2('csrf_access_token'),
                'Authorization': `Bearer ${await this.getCookie2('access_token_cookie')}`,
            },
        };

        if (method.toLowerCase() === 'post' && data) {
            options.body = dataType === 'formData' ? data : JSON.stringify(data);
        }

        return options;
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


