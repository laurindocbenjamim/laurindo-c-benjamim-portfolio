import json
import re
string="""

```json
{
  "cv_in_html_format": "<!DOCTYPE html><html lang=\"en\"><head><meta charset=\"UTF-8\"><meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\"><style>body { font-family: Arial, sans-serif; line-height: 1.6em; margin: 20px; } h1 { color: #333; } h2 { color: #555; } p, li { color: #444; } ul { padding-left: 20px; }</style><title>Laurindo C. Benjamim - CV</title></head><body><h1>Laurindo C. Benjamim</h1><p>Porto, Portugal | (+351) 93-344-3506 | <a href=\"mailto:laurindocbenjamim@gmail.com\">laurindocbenjamim@gmail.com</a> | <a href=\"https://www.linkedin.com/in/laurindocbenjamim/\">LinkedIn</a></p><h2>Summary</h2><p>Dynamic Data Engineer with more than 3 years of hands-on experience in designing and implementing robust data solutions. Passionate about ETL processes, data modeling, and data warehousing, with proven expertise in optimizing and managing data pipelines. Proficient in Talend and DBT, adept at using Azure tools like Databricks and Data Factory. Fluent in Portuguese and English, thrives in multicultural and innovative environments.</p><h2>Core Skills</h2><ul><li>Data Engineering: ETL processes, Data modeling, Data pipelines, Talend, DBT</li><li>Programming: Python, SQL, JavaScript, Flask, Angular</li><li>Cloud Platforms: Azure (Databricks, Data Factory), AWS, GCP</li><li>Data Warehousing & BI: Star and Snowflake Schema, IBM Cognos Analytics, MS Power BI</li><li>Tools: Apache Airflow, Apache Kafka, shell scripting</li></ul><h2>Professional Experience</h2><h3>Data Engineer</h3><p>Self-Initiated & Academic Projects | January 2024 - Present</p><ul><li>Designed and developed a robust ETL pipeline for waste management, enhancing data integration accuracy by 30%.</li><li>Created a highly accurate sentiment analysis tool with a 90% success rate using IBM Watson NLP API.</li><li>Implemented a reliable weather data extraction system, improving data processing efficiency by 25%.</li></ul><h3>Python and Web Development Trainer</h3><p>Charkcoders, Gaia, Portugal | September 2023 � Present</p><ul><li>Facilitated Python and web development training, contributing to a 75-90% improvement in participants' skill acquisition.</li></ul><h3>Full-Stack Developer</h3><p>Instituto Polit�cnico Privado Esperan�a do Lubango, Angola | January 2018 - November 2021</p><ul><li>Delivered a Java-based file management system with a 98% requirement match, streamlining file operations.</li></ul><p>ELT - Contas, Lda, Lubango, Angola | March 2019 - September 2021</p><ul><li>Spearheaded the development of a shopping application in Laravel, achieving a 70% project success rate.</li></ul><h2>Education</h2><ul><li>Master's in Biomedical Engineering, Universidade Cat�lica Portuguesa do Porto, Portugal (In Progress, 2023 � Present)</li><li>Tecnologo em Analise e Desenvolvimento de Sistemas, AIEC Brasil (2021)</li><li>Bachelor�s in Computer Engineering, Universidade Jos� Eduardo dos Santos, Angola (2017)</li></ul><h2>Certifications</h2><ul><li>IBM Data Engineering Professional Certificate, Coursera (2024 � Present)</li><li>IBM Full Stack Software Developer Professional Certificate, Coursera (2024)</li></ul><h2>Languages</h2><ul><li>Portuguese � Native</li><li>English � Fluent</li><li>Spanish � Basic</li></ul><h2>Portfolio</h2><p>For project examples and additional work, please visit: <a href=\"https://www.d-tuning.com/profile/laurindo-c-benjamim\">Portfolio</a></p></body></html>",
  
  "cv_in_docx_format": "Laurindo C. Benjamim\nPorto, Portugal | (+351) 93-344-3506 | laurindocbenjamim@gmail.com | https://www.linkedin.com/in/laurindocbenjamim/\n\nSummary\nDynamic Data Engineer with more than 3 years of hands-on experience in designing and implementing robust data solutions. Passionate about ETL processes, data modeling, and data warehousing, with proven expertise in optimizing and managing data pipelines. Proficient in Talend and DBT, adept at using Azure tools like Databricks and Data Factory. Fluent in Portuguese and English, thrives in multicultural and innovative environments.\n\nCore Skills\n- Data Engineering: ETL processes, Data modeling, Data pipelines, Talend, DBT\n- Programming: Python, SQL, JavaScript, Flask, Angular\n- Cloud Platforms: Azure (Databricks, Data Factory), AWS, GCP\n- Data Warehousing & BI: Star and Snowflake Schema, IBM Cognos Analytics, MS Power BI\n- Tools: Apache Airflow, Apache Kafka, shell scripting\n\nProfessional Experience\nData Engineer\nSelf-Initiated & Academic Projects | January 2024 - Present\n- Designed and developed a robust ETL pipeline for waste management, enhancing data integration accuracy by 30%.\n- Created a highly accurate sentiment analysis tool with a 90% success rate using IBM Watson NLP API.\n- Implemented a reliable weather data extraction system, improving data processing efficiency by 25%.\n\nPython and Web Development Trainer\nCharkcoders, Gaia, Portugal | September 2023 � Present\n- Facilitated Python and web development training, contributing to a 75-90% improvement in participants' skill acquisition.\n\nFull-Stack Developer\nInstituto Polit�cnico Privado Esperan�a do Lubango, Angola | January 2018 - November 2021\n- Delivered a Java-based file management system with a 98% requirement match, streamlining file operations.\n\nELT - Contas, Lda, Lubango, Angola | March 2019 - September 2021\n- Spearheaded the development of a shopping application in Laravel, achieving a 70% project success rate.\n\nEducation\n- Master's in Biomedical Engineering, Universidade Cat�lica Portuguesa do Porto, Portugal (In Progress, 2023 � Present)\n- Tecnologo em Analise e Desenvolvimento de Sistemas, AIEC Brasil (2021)\n- Bachelor�s in Computer Engineering, Universidade Jos� Eduardo dos Santos, Angola (2017)\n\nCertifications\n- IBM Data Engineering Professional Certificate, Coursera (2024 � Present)\n- IBM Full Stack Software Developer Professional Certificate, Coursera (2024)\n\nLanguages\n- Portuguese � Native\n- English � Fluent\n- Spanish � Basic\n\nPortfolio\nFor project examples and additional work, please visit: https://www.d-tuning.com/profile/laurindo-c-benjamim",
  
  "cv_in_plain_text_format": "Laurindo C. Benjamim\nPorto, Portugal | (+351) 93-344-3506 | laurindocbenjamim@gmail.com | https://www.linkedin.com/in/laurindocbenjamim/\n\nSummary\nDynamic Data Engineer with more than 3 years of hands-on experience in designing and implementing robust data solutions. Passionate about ETL processes, data modeling, and data warehousing, with proven expertise in optimizing and managing data pipelines. Proficient in Talend and DBT, adept at using Azure tools like Databricks and Data Factory. Fluent in Portuguese and English, thrives in multicultural and innovative environments.\n\nCore Skills\n- Data Engineering: ETL processes, Data modeling, Data pipelines, Talend, DBT\n- Programming: Python, SQL, JavaScript, Flask, Angular\n- Cloud Platforms: Azure (Databricks, Data Factory), AWS, GCP\n- Data Warehousing & BI: Star and Snowflake Schema, IBM Cognos Analytics, MS Power BI\n- Tools: Apache Airflow, Apache Kafka, shell scripting\n\nProfessional Experience\nData Engineer\nSelf-Initiated & Academic Projects | January 2024 - Present\n- Designed and developed a robust ETL pipeline for waste management, enhancing data integration accuracy by 30%.\n- Created a highly accurate sentiment analysis tool with a 90% success rate using IBM Watson NLP API.\n- Implemented a reliable weather data extraction system, improving data processing efficiency by 25%.\n\nPython and Web Development Trainer\nCharkcoders, Gaia, Portugal | September 2023 � Present\n- Facilitated Python and web development training, contributing to a 75-90% improvement in participants' skill acquisition.\n\nFull-Stack Developer\nInstituto Polit�cnico Privado Esperan�a do Lubango, Angola | January 2018 - November 2021\n- Delivered a Java-based file management system with a 98% requirement match, streamlining file operations.\n\nELT - Contas, Lda, Lubango, Angola | March 2019 - September 2021\n- Spearheaded the development of a shopping application in Laravel, achieving a 70% project success rate.\n\nEducation\n- Master's in Biomedical Engineering, Universidade Cat�lica Portuguesa do Porto, Portugal (In Progress, 2023 � Present)\n- Tecnologo em Analise e Desenvolvimento de Sistemas, AIEC Brasil (2021)\n- Bachelor�s in Computer Engineering, Universidade Jos� Eduardo dos Santos, Angola (2017)\n\nCertifications\n- IBM Data Engineering Professional Certificate, Coursera (2024 � Present)\n- IBM Full Stack Software Developer Professional Certificate, Coursera (2024)\n\nLanguages\n- Portuguese � Native\n- English � Fluent\n- Spanish � Basic\n\nPortfolio\nFor project examples and additional work, please visit: https://www.d-tuning.com/profile/laurindo-c-benjamim",
  
  "Changes Summary": "The optimized CV includes ATS-friendly keywords directly from the job description, such as 'Talend', 'DBT', and Azure tools. The achievements have been quantified to demonstrate impact, such as improving data integration accuracy and efficiency in data processing. The CV structure aligns with the requirements, with a clear summary highlighting both technical and social skills. Key skills and experiences are matched with job requirements, and additional details on achievements were added for clarity. The document maintains a clean presentation suitable for both human and ATS review, formatted in HTML, DOCX, and plain text to ensure accessibility across different platforms.",
}
```

"""

json_string=str(string).replace('```json', '').replace('```', '').strip()
print(json_string)

# Ensure correct encoding
json_bytes = json_string.encode("utf-8")
json_string = json_bytes.decode("utf-8")


# Remove any trailing commas that may exist
json_string = re.sub(r',\s*}', '}', json_string)  # For commas before closing curly braces
json_string = re.sub(r',\s*]', ']', json_string)  # For commas before closing square brackets



# Define users as a dictionary for better key-value access
users = {
  "username": "admin",
  "password": "password123"
}

# Check if the username and password match
if users.get("username") == "admin" and users.get("password") == "password123":
  print("Estou la")
else:
  print("Invalid credentials")

# Parse JSON safely
try:
    data = json.loads(json_string)
    print(data)
except json.JSONDecodeError as e:
    print(f"JSON Decode Error: {e}")


from werkzeug.security import generate_password_hash, check_password_hash

print(f"HASH Password: {generate_password_hash('1234')}")
class User:
  def get_user_test(self):
        return {
            'id': 1,
            'username': 'Admin',
            'email': 'admin@datatuning.io',
            'password_hash': 'scrypt:32768:8:1$JOho73zuSUMoMVC2$355834fe2dc1808bc855f9134a068175744e3a4e8acc4250f52e84d68f475c828631764c1185432453ee7ed3dd5da737467d2634e7119c1fa95433672c6b83d1'
        }

user=User().get_user_test()
print("USER: "+ user['username'])
rep=check_password_hash(user['username'], '1234')


import secrets

secret_key = secrets.token_urlsafe(64)  # Generates a secure 32-byte key
print("Secure SECRET-KEY: "+secret_key)


import sqlite3

# Connect to the SQLite database (or create it if it doesn't exist)
conn = sqlite3.connect('instance/db.sqlite')

# Create a cursor object
cursor = conn.cursor()

# Fetch data from the database
cursor.execute("SELECT * FROM user WHERE id = 1")

# Fetch one record and print it
user_record = cursor.fetchone()
print("User Record:", user_record)

# Define the SQL query
sql_query = """
INSERT INTO user (id, username, email, fullname, password_hash, is_admin)
VALUES (1, 'admin', 'admin@gmail.com', 'Laurindo benjamim', 'scrypt:32768:8:1$YxeSCCOd8MMe59Dp$e7e0937b77737ab7013d162fecb667285c5fa40d3050ac9657d46876afddc32afd5023ee10b2831bf48c2f20373e19ed5733e9beb2b556bd931cf45ec071517e', True);
"""
# Fetch data from the database
cursor.execute("SELECT * FROM user WHERE id = 1")

# Fetch one record and print it
user_record = cursor.fetchone()
print("User Record:", user_record)

# Execute the SQL query
cursor.execute(sql_query)

# Commit the transaction
conn.commit()

# Close the connection
conn.close()

