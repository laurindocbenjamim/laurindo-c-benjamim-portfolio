
class Country{
    constructor(){
        
        this.api='http://localhost:5000/api/v1/web-scrapping/countries';

        if (window.location.origin.includes('.github.io') || window.location.origin.includes('laurindocbenjamim.pt')) {
            this.api='https://www.d-tuning.com/api/v1/web-scrapping/countries';
        }
    }

    async getCountries() {
        const options = {
            method: 'get',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json'
            },
        };
        let response = null;

        try {
            response = await fetch(this.api, options);
            return await response.json();
        } catch (error) {
            console.error("Request failed to get countries:", error);
            console.error("Failed to connect to the server. Please try again later.");
            return response;
        }
    }
}