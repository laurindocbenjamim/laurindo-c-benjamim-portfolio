import os
import subprocess
from flask import render_template, request, current_app as bp, redirect, url_for, flash, send_file
from werkzeug.utils import secure_filename
from double.forms import VideoForm
from double.utils import process_youtube_video, allowed_file, sanitize_input

UPLOAD_FOLDER = 'app/static/uploads'

def setup_upload_folder():
    if not os.path.exists(UPLOAD_FOLDER):
        os.makedirs(UPLOAD_FOLDER)

setup_upload_folder()

@bp.route('/', methods=['GET', 'POST'])
def index():
    form = VideoForm()
    if form.validate_on_submit():
        youtube_url = form.youtube_url.data
        sanitized_url = sanitize_input(youtube_url)
        if not sanitized_url.startswith("https://www.youtube.com"):
            flash('Invalid YouTube URL.', 'danger')
            return redirect(url_for('index'))

        output_file = process_youtube_video(sanitized_url)
        return send_file(output_file, as_attachment=True)

    return render_template('index.html', form=form)
