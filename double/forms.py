from flask_wtf import FlaskForm
from wtforms import StringField, SubmitField
from wtforms.validators import DataRequired, URL

class VideoForm(FlaskForm):
    youtube_url = StringField('YouTube URL', validators=[DataRequired(), URL()])
    submit = SubmitField('Translate Video')
