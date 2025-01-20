


// csrf.js
let globalCsrfToken = '';
let csrfToken = ''

export async function fetchCsrfToken() {
    try {
        const response = await fetch('http://localhost:5000/api/csrf-token/get', { method: 'GET' });
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP error! Status: ${response.status}. Response: ${errorText}`);
        }
        const data = await response.json();
        globalCsrfToken = data.csrf_token;  // Set the global variable
        //console.log('CSRF token fetched:', globalCsrfToken);
    } catch (error) {
        console.error('Error fetching CSRF token:', error);
    }
}

async function handleError(error) {
    document.getElementById('btnSubmit').innerHTML = '<span>Submit</span>';
    document.getElementById('error-message').textContent = error
    document.getElementById('success-message').textContent = ''
    console.log(error)
}

async function handleResponse(form, resp) {
    document.getElementById('btnSubmit').innerHTML = '<span>Submit</span>';
    console.log(resp)
    //const resp = JSON.parse(response);
    if (resp.status === 400 || resp.error) {
        document.getElementById('error-message').textContent = resp.error;
        document.getElementById('success-message').textContent = '';
    }

    const downloadUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.classList.add('btn')
    link.classList.add('btn-primary')
    link.classList.add('btn-lg')
    link.href = downloadUrl;
    link.download = `unrestricted_${file.name}`;
    document.getElementById('div-alerts').appendChild(link);
    link.click();
    link.remove();
    document.getElementById('success-message').textContent = 'File processed successfully!';

};

async function getCookie(name) {
    let cookieValue = null; if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1)); break;
            }
        }
    }
    csrfToken = cookieValue
    return cookieValue;
}

//const csrfToken = getCookie('csrf_token');

export async function submitForm(endpoint, formData) {
    if (!globalCsrfToken) {
        await fetchCsrfToken();
    }

    const headers = new Headers()
    //headers.append('X-CSRF-Token', globalCsrfToken)
    headers.append('X-CSRFToken', globalCsrfToken)
    //headers.append("Authorization", ` Bearer ${globalCsrfToken}`);

    // Setting the csrf-token into the form
    formData.append('csrf_token', globalCsrfToken)
    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            body: formData,
            headers: headers,
            //credentials: 'same-origin' // Make sure cookies are sent with the request
        });
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP error! Status: ${response.status}. Response: ${errorText}`);
        }
        const result = await response.json();
        console.log('Form submitted successfully:', result);
        handleResponse(form, result)
        return result
    } catch (error) {
        handleError(error)
        console.error('Error submitting form:', error);
        return false
    }
}
