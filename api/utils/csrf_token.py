from flask import jsonify
from flask_restful import Resource
from flask_wtf.csrf import generate_csrf

class CSRFToken(Resource):
    def get(self):
        #token = csrf_global._get_token()
        return jsonify({'csrf_token': generate_csrf()})


