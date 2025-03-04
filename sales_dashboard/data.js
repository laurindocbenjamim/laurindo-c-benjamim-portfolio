// js/data.js
export async function fetchData() {
  return new Promise((resolve, reject) => {
    try {
      const data = {
        "sales": [
          { "date": "2020-01-10", "region": "North", "category": "Electronics", "revenue": 15000, "profit": 3000 },
          { "date": "2020-03-15", "region": "South", "category": "Clothing", "revenue": 12000, "profit": 2500 },
          { "date": "2020-05-20", "region": "East", "category": "Furniture", "revenue": 18000, "profit": 4000 },
          { "date": "2020-07-25", "region": "West", "category": "Electronics", "revenue": 22000, "profit": 5000 },
          { "date": "2021-02-10", "region": "North", "category": "Clothing", "revenue": 13000, "profit": 2700 },
          { "date": "2021-04-18", "region": "South", "category": "Furniture", "revenue": 21000, "profit": 4200 },
          { "date": "2021-06-22", "region": "East", "category": "Electronics", "revenue": 16000, "profit": 3200 },
          { "date": "2021-09-30", "region": "West", "category": "Clothing", "revenue": 14000, "profit": 2800 },
          { "date": "2022-01-05", "region": "North", "category": "Furniture", "revenue": 19000, "profit": 3500 },
          { "date": "2022-03-12", "region": "South", "category": "Electronics", "revenue": 23000, "profit": 4600 },
          { "date": "2022-05-18", "region": "East", "category": "Clothing", "revenue": 12500, "profit": 2600 },
          { "date": "2022-08-24", "region": "West", "category": "Furniture", "revenue": 20000, "profit": 3800 },
          { "date": "2023-02-14", "region": "North", "category": "Electronics", "revenue": 24000, "profit": 4800 },
          { "date": "2023-04-19", "region": "South", "category": "Clothing", "revenue": 11000, "profit": 2200 },
          { "date": "2023-07-23", "region": "East", "category": "Furniture", "revenue": 26000, "profit": 5200 },
          { "date": "2023-10-05", "region": "West", "category": "Electronics", "revenue": 27000, "profit": 5400 },
          { "date": "2024-01-11", "region": "North", "category": "Clothing", "revenue": 15000, "profit": 3000 },
          { "date": "2024-03-20", "region": "South", "category": "Furniture", "revenue": 22000, "profit": 4400 },
          { "date": "2024-06-30", "region": "East", "category": "Electronics", "revenue": 25000, "profit": 5000 },
          { "date": "2024-09-15", "region": "West", "category": "Clothing", "revenue": 13000, "profit": 2600 }
        ]
      };
      resolve(data.sales);
    } catch (err) {
      reject(err);
    }
  });
}



// js/data.js
export async function fetchDataFromKaggleHubAPI() {
  try {
    // Replace the URL below with the actual Kagglehub API endpoint for your dataset.
    const apiUrl = 'https://api.kagglehub.com/datasets/kyanyoga/sample-sales-data?format=json';
    const response = await fetch(apiUrl, {
      // If the API requires authentication, add the appropriate headers here.
      // headers: {
      //   'Authorization': 'Bearer YOUR_API_TOKEN',
      // }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch dataset from Kagglehub API');
    }
    
    const data = await response.json();
    // Assumes that the returned JSON has a structure like { "sales": [ ... ] }
    return data.sales;
  } catch (error) {
    console.error("Error fetching Kagglehub dataset:", error);
    throw error;
  }
}



// js/data.js
export async function fetchData_from_json() {
  // Option 1: Load data from a JSON file.
  try {
    const response = await fetch('data/sales_data.json');
    if (!response.ok) {
      alert("Error: "+response.ok)
      throw new Error('Failed to fetch JSON data');
    }
    const data = await response.json();
    // Assumes the JSON file has a structure like: { "sales": [ ... ] }
    return data.sales;
  } catch (error) {
    console.error("Error fetching JSON data:", error);
    // Optionally, you could try a fallback method such as fetching CSV data:
    // return fetchCSVData();
    throw error;
  }
}


// Option 2: Load data from a CSV file using PapaParse.
// To use this method, ensure you include PapaParse in your HTML and comment out the JSON method above.
export async function fetchCSVData() {
  try {
    const response = await fetch('../data/sales_data.csv');
    if (!response.ok) {
      throw new Error('Failed to fetch CSV data');
    }
    const csvText = await response.text();
    return new Promise((resolve, reject) => {
      Papa.parse(csvText, {
        header: true,        // Expect headers in the first row
        dynamicTyping: true, // Automatically convert numeric fields
        complete: (results) => {
          // The parsed data will be available in results.data
          resolve(results.data);
        },
        error: (err) => {
          reject(err);
        }
      });
    });
  } catch (error) {
    console.error("Error fetching CSV data:", error);
    throw error;
  }
}
