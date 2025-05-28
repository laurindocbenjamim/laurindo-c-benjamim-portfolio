# app.py continued
import os
from werkzeug.utils import secure_filename
from moviepy.editor import VideoFileClip, AudioFileClip, concatenate_audioclips

# ... previous Flask code ...

@app.route('/save_recording', methods=['POST'])
def save_recording():
    if 'audio' not in request.files:
        return jsonify({'success': False, 'message': 'No audio file uploaded'})
    
    audio_file = request.files['audio']
    video_id = request.form.get('video_id')
    
    if not video_id:
        return jsonify({'success': False, 'message': 'No video ID provided'})
    
    recording_id = str(uuid.uuid4())
    filename = f"recording_{recording_id}.wav"
    filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    audio_file.save(filepath)
    
    return jsonify({
        'success': True,
        'recording_id': recording_id,
        'recording_url': f"uploads/{filename}"
    })

@app.route('/delete_track/<track_id>', methods=['DELETE'])
def delete_track(track_id):
    filename = f"recording_{track_id}.wav"
    filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    
    try:
        if os.path.exists(filepath):
            os.remove(filepath)
            return jsonify({'success': True})
        return jsonify({'success': False, 'message': 'File not found'})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)})

@app.route('/merge', methods=['POST'])
def merge():
    data = request.json
    video_id = data.get('video_id')
    items = data.get('items', [])
    
    if not video_id or not items:
        return jsonify({'success': False, 'message': 'Invalid request'})
    
    try:
        # Get video path
        video_path = os.path.join(app.config['UPLOAD_FOLDER'], f"{video_id}.mp4")
        video_clip = VideoFileClip(video_path)
        
        # Collect audio clips
        audio_clips = []
        for item in items:
            if item['type'] == 'track':
                audio_path = os.path.join(app.config['UPLOAD_FOLDER'], f"recording_{item['id']}.wav")
                audio_clips.append(AudioFileClip(audio_path))
        
        if not audio_clips:
            return jsonify({'success': False, 'message': 'No audio tracks to merge'})
        
        # Combine audio tracks
        final_audio = concatenate_audioclips(audio_clips)
        
        # Set combined audio to video
        final_clip = video_clip.set_audio(final_audio)
        
        # Save merged video
        output_filename = f"merged_{video_id}.mp4"
        output_path = os.path.join(app.config['UPLOAD_FOLDER'], output_filename)
        final_clip.write_videofile(output_path, codec='libx264', audio_codec='aac')
        
        return jsonify({
            'success': True,
            'merged_url': f"uploads/{output_filename}"
        })
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)})

@app.route('/save_script', methods=['POST'])
def save_script():
    data = request.json
    video_id = data.get('video_id')
    script = data.get('script')
    
    if not video_id or not script:
        return jsonify({'success': False, 'message': 'Invalid request'})
    
    try:
        # In a real app, you'd save to a database
        script_filename = f"script_{video_id}.html"
        script_path = os.path.join(app.config['UPLOAD_FOLDER'], script_filename)
        
        with open(script_path, 'w') as f:
            f.write(script)
        
        return jsonify({'success': True})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)})