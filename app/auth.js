class AuthClient {
    constructor() {
        this.baseUrl ='http://localhost:5000' //window.location.origin;
        this.isRefreshing = false;
        this.retryQueue = [];
    }

    getCSRFToken(cookieName) {
        const acce_token = localStorage.getItem('access_token')
        console.log('Stored token: '+acce_token)
        return acce_token
        return acce_token? acce_token : document.cookie
            .split('; ')
            .find(row => row.startsWith(`${cookieName}=`))
            ?.split('=')[1] || '';
    }

    async handleRequest(url, options) {
        try {
            
            const response = await fetch(url, {
                ...options,
                headers: {
                    'Content-Type': 'application/json',
                    //'X-CSRF-TOKEN': this.getCSRFToken('csrf_access_token'),
                    'Authorization': `Bearer ${this.getCSRFToken('csrf_refresh_token')}`,
                    //...options.headers
                    credentials: 'include',
                    mode: 'cors'
                }
            });

            if (response.status === 401 && !this.isRefreshing) {
                this.isRefreshing = true;
                
                try {
                    console.log('Retrying the request...')
                    //await this.refreshToken();
                    const retryResponse = await fetch(url, options);
                    console.log('Response: ')
                    console.log(retryResponse)
                    this.retryQueue.forEach(cb => cb());
                    return retryResponse;
                } catch (refreshError) {
                    this.retryQueue = [];
                    throw refreshError;
                } finally {
                    this.isRefreshing = false;
                }
            }

            if (!response.ok) throw await response.json();
            return response.json();

        } catch (error) {
            if (error.statusCode === 401) {
                //window.location.href = '/login';
            }
            throw error;
        }
    }

    async login(username, password) {
        return this.handleRequest(`${this.baseUrl}/login`, {
            method: 'POST',
            body: JSON.stringify({ username, password })
        });
    }

    async refreshToken() {
        
            const response = await fetch(`${this.baseUrl}/refresh`, {
                method: 'POST',
                mode: 'cors',
                credentials: 'include',                
                headers: {
                    //'X-CSRF-REFRESH-TOKEN': this.getCSRFToken('csrf_refresh_token'),
                    'Authorization': `Bearer ${this.getCSRFToken('csrf_refresh_token')}`
                }
            });
             
            if (!response.ok) {
                throw new Error('Refresh token failed');
            }
            
            return response.json();
    }

    async logout() {
        return this.handleRequest(`${this.baseUrl}/logout`, {
            method: 'POST'
        });
    }

    async getProtectedData() {
        return this.handleRequest(`${this.baseUrl}/api/protected`);
    }
}