import os
from pytube import YouTube
from whisper import load_model
from googletrans import Translator
from gtts import gTTS
from werkzeug.utils import secure_filename

ALLOWED_EXTENSIONS = {'mp4', 'avi', 'mov'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def sanitize_input(input_string):
    return input_string.strip()

def process_youtube_video(youtube_url):
    yt = YouTube(youtube_url)
    video_stream = yt.streams.filter(only_audio=True).first()
    output_path = f'app/static/uploads/{secure_filename(yt.title)}.mp4'
    video_stream.download(output_path=output_path)

    model = load_model("base")
    transcription = model.transcribe(output_path)

    translator = Translator()
    translated_text = translator.translate(transcription['text'], src='en', dest='pt')

    tts = gTTS(translated_text.text, lang='pt')
    audio_path = output_path.replace('.mp4', '_translated.mp3')
    tts.save(audio_path)

    return audio_path
