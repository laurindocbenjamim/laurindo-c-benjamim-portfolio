
# call the applicattions
#from api.__init__ import create_app
from jwt_2 import create_app
from flask_migrate import Migrate
from api.utils.extensions import db

app = create_app()

# This function is used to migrate the database
Migrate(app, db)

if __name__ == '__main__':
    db.init_app(app)

    with app.app_context():
        db.create_all()

    app.run(
        #ssl_context='adhoc', 
        debug=True, 
        port=5000)