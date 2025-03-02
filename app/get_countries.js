
class Country{
    constructor(){
        this.api='https://www.d-tuning.com/api/v1/web-scrapping/countries';
    }

    async getCountries() {
        const options = {
            method: 'get',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json'
            },
        };
    
        const response = fetch(this.api, options);
        return response.json();
    }
}