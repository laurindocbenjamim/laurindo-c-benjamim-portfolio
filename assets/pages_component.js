
fetch('pages/navbar.html').then(response => { if (response.ok) { return response.text(); } 
    throw new Error(`${response.status} ${response.statusText} ${response.url}`)    
}).then(data=>document.getElementById("navbar").innerHTML = data).catch(err => console.error(err));

fetch('pages/sidebar.html').then(response => { if (response.ok) { return response.text(); } 
    throw new Error(`${response.status} ${response.statusText} ${response.url}`)    
}).then(data=>document.getElementById("sidebar").innerHTML = data).catch(err => console.error(err));

fetch('pages/footer.html').then(response => { if (response.ok) { return response.text(); } 
    throw new Error(`${response.status} ${response.statusText} ${response.url}`)    
}).then(data=>document.getElementById("footer").innerHTML = data).catch(err => console.error(err));
