
import {submitForm} from './_token.js'

document.addEventListener('DOMContentLoaded', () => {
    //const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute("content");

    const form = document.getElementById('dataForm')
    const spinnerHtml = `<span class="spinner-grow spinner-grow-sm" aria-hidden="true"></span>
    <span role="status">Loading...</span>`;

    const dropzone = document.getElementById('dropzone');
    const fileInput = document.getElementById('file');
    const fileList = document.getElementById('file-list').getElementsByTagName('tbody')[0];
    //const uploadProgress = document.getElementById('uploadProgress').querySelector('.progress-bar');
    //const progressPercentage = document.getElementById('progressPercentage');
    //const uploadButton = document.getElementById('uploadButton');
    const uploadStatus = document.getElementById('uploadStatus');

    dropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropzone.classList.add('hover');
    });

    dropzone.addEventListener('dragleave', () => {
        dropzone.classList.remove('hover');
    });

    dropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropzone.classList.remove('hover');
        fileInput.files = e.dataTransfer.files;
        displayFileList();
    });

    dropzone.addEventListener('click', () => {
        fileInput.click();
    });

    fileInput.addEventListener('change', () => {
        displayFileList();
    });

    function displayFileList() {
        fileList.innerHTML = '';
        for (const file of fileInput.files) {
            const row = document.createElement('tr');
            row.innerHTML = `
            <td>${file.name}</td>
            <td>${(file.size / 1024).toFixed(2)} KB</td>
            <td>Waiting...</td>
        `;
            fileList.appendChild(row);
        }
    }
    function validate_file(file) {
        try {
            jobRequirementsFile = file[0];
            if (!jobRequirementsFile) {
                throw Error("File not found or not selected!")
            }
        } catch (err) { }
        // Validate file size (example: max 2MB) 

        //const objectives = Array.from(document.querySelectorAll('input[name="objectives[]"]')).map(input => input.value);
        if (file.size > 2 * 1024 * 1024) {
            document.getElementById('btnSubmit').innerHTML = '<span>Submit</span>';
            throw Error('File size must be less than 2MB')
        }
    }

    

    function validateVideoSize(file, sizeMB) {
        // Validate file size (example: max 2MB) 

        //const objectives = Array.from(document.querySelectorAll('input[name="objectives[]"]')).map(input => input.value);
        if (file.size > sizeMB * 1024 * 1024) {
            document.getElementById('btnSubmit').innerHTML = '<span>Submit</span>';
            throw new Error('File size must be less than or equal 16MB')
        }
    }
    // Submiting the form 
    form.addEventListener('submit', (event) => {
        event.preventDefault()
        if (!form.checkValidity()) {
            event.stopPropagation();
            form.classList.add("was-validated");
            return;
        }

        let endpoint = window.location.origin + '';
        document.getElementById('btnSubmit').innerHTML = spinnerHtml
       

        const formData = new FormData(event.target)

        // Validate document File
        const videoFileToAnalyze = document.getElementById("videoFileToAnalyze");
        //let jobRequirementsFile = ""

        
            try {
                //jobRequirementsFile = videoFileToAnalyze.files[0];
                if (!videoFileToAnalyze.files[0]) {
                    throw Error("File not found or not selected!")
                }
            } catch (err) { }
            // Validate file size (example: max 2MB) 

            const file = formData.get('videoFileToAnalyze');
            //const objectives = Array.from(document.querySelectorAll('input[name="objectives[]"]')).map(input => input.value);
            
           try {
            validateVideoSize(file, 16)
           } catch (error) {
            document.getElementById('error-message').textContent=error;
            document.getElementById('success-message').textContent='';
            return error
           }
       


        document.getElementById('btnSubmit').innerHTML = spinnerHtml
        endpoint = 'http://127.0.0.1:5000/videos/post'
        
        submitForm(endpoint, formData)
    })

    
    // Submiting the form 
    // Add event listener for the form submit event
    /*form.addEventListener('submit', (event) => {
        event.preventDefault(); // Prevent the default form submission behavior

        // Validate the form
        if (!form.checkValidity()) {
            event.stopPropagation();
            form.classList.add("was-validated"); // Add validation class if the form is invalid
            return;
        }
        document.getElementById('btnSubmit').innerHTML = spinnerHtml
        // Define the backend endpoint for file uploads
        let endpoint = window.location.origin + '/api/files-storage/upload';
        document.getElementById('btnSubmit').innerHTML = spinnerHtml; // Show loading spinner on submit button

        const formData = new FormData(event.target); // Create a FormData object with the form data

        // Validate files
        const files = document.getElementById("file").files; // Get the selected files
        const maxFileSize = 16 * 1024 * 1024; // Define max file size (2MB)

        // Iterate through the selected files and validate them
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            try {
                const sms = validateVideoSize(file)
            } catch (err) {
                document.getElementById('btnSubmit').innerHTML = ''
                document.getElementById('error-message').textContent = err;
                return;
            }
            formData.append('file', file); // Append the file to FormData
        }

        document.getElementById('btnSubmit').innerHTML = spinnerHtml
        endpoint = 'http://127.0.0.1:5000/api/files-storage/upload'
        // Send the files to the backend using fetch API
        fetch(endpoint, {
            method: 'POST', // HTTP method
            body: formData, // Form data with multiple files
        })
            .then(response => {
                if (response.ok) {
                    return response.json(); // Parse the JSON response if status is OK
                } else {
                    throw new Error(`Error: ${response.status} ${response.statusText} ${response.url}`);
                }
            })
            .then(data => {
                
                // Handle the backend response
                if (data.error) {
                    document.getElementById('error-message').textContent = data.error; // Show error message
                } else {
                    form.reset(); // Reset the form on successful upload
                    document.getElementById('success-message').textContent = data.message; // Show success message
                }
                document.getElementById('btnSubmit').innerHTML = '<span>Submit</span>'; // Reset submit button
            })
            .catch((error) => {
                document.getElementById('error-message').textContent = error; // Show the error message from catch block
                document.getElementById('success-message').textContent = '';
                document.getElementById('btnSubmit').innerHTML = '<span>Submit</span>'; // Reset submit button
            });
    });*/

})

document.getElementById('downloadWord').addEventListener('click', () => {
    alert('Download as Word is not yet implemented.');
});

document.getElementById('downloadPDF').addEventListener('click', () => {
    alert('Download as PDF is not yet implemented.');
});