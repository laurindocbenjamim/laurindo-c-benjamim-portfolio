
import os
import secrets
import string
import imghdr
import uuid
from flask import Flask, Blueprint, send_file,request, current_app
from flask import jsonify
from werkzeug.utils import secure_filename
from werkzeug.middleware.proxy_fix import ProxyFix
from flask_cors import CORS
from flask_restful import Api, Resource
