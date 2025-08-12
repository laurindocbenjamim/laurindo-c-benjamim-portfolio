
import { RequestFactory } from './request_factory.js'



document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById('paymentForm');


    const request = new RequestFactory()

    async function getPK() {

        const endpoint = '/api/v1/pay/stripe';

        const options = await request.createOptions('get');

        const response = await request.makeRequest(options, endpoint);

        if (response === null || !response.ok === undefined) {
            const message = await request.handlingErrors(response);

            console.error("Failed to get the PK!");
            console.error(message);
            return null;
        }
        console.log(response);
        console.log("Success");

        return response;

    }


    document.getElementById('btnSubmit').addEventListener('click', async (event) => {
        event.preventDefault();

        if (!form.checkValidity()) {
            event.stopPropagation();
            form.classList.add("was-validated");
            return;
        }

        try {
            const options = await request.createOptions('POST', { "data": "" });
        
            const response = await fetch(`${request.serverDomain}/api/v1/pay/stripe`, options);
        
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
        
            const session = await response.json(); // Parse the JSON from the response
        
            const pk = await getPK();
            if (!pk) {
                throw new Error("Failed to retrieve the public key.");
            }
        
            if(session.error){
                console.log("Session")
                //console.log(session)
                console.error(session.error)
                return ;
            }
            const stripe = window.Stripe(pk);
        
            const { error } = await stripe.redirectToCheckout({ sessionId: session.id });
        
            if (error) {
                console.error("Stripe checkout error:", error);
            }
        } catch (error) {
            console.error("Request failed:", error);
            document.getElementById('spinnerBorder').style.display = 'none';
            document.getElementById('errorMessage').innerText = error.message;
            document.getElementById('successMessage').innerText = '';
        }
        


    })


})