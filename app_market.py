
from flask_migrate import Migrate
from market import create_app, jwt, limiter
from market.config import db
from market.config_jwt import config_jwt
#from market.routes import routes


app = create_app(True)

if __name__ == '__main__':
    """
    
    """
    limiter.init_app(app)
    jwt.init_app(app)
    config_jwt(app=app,jwt=jwt)

    db.init_app(app)    

    with app.app_context():
        db.create_all()        
        # Migrate the database
        migrate = Migrate(app, db)
        
    #routes(app)
    app.run(ssl_context='adhoc', debug=app.config['TESTING'], port=app.config['PORT'])
    