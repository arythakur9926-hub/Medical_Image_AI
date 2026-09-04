"""
Web application for Medical Image AI - Flask-based web interface
"""
from flask import Flask, render_template, request, jsonify, send_file
from werkzeug.utils import secure_filename
import os
from datetime import datetime
import io
from PIL import Image
import numpy as np

app = Flask(__name__, template_folder='templates', static_folder='static')
app.config['MAX_CONTENT_LENGTH'] = 50 * 1024 * 1024  # 50MB max file size
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['ALLOWED_EXTENSIONS'] = {'png', 'jpg', 'jpeg', 'dcm', 'dicom'}

# Create upload folder if it doesn't exist
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in app.config['ALLOWED_EXTENSIONS']

@app.route('/')
def index():
    """Main page"""
    return render_template('index.html')

@app.route('/api/upload', methods=['POST'])
def upload_file():
    """Handle file upload"""
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file part'}), 400
        
        file = request.files['file']
        
        if file.filename == '':
            return jsonify({'error': 'No selected file'}), 400
        
        if not allowed_file(file.filename):
            return jsonify({'error': 'File type not allowed'}), 400
        
        filename = secure_filename(file.filename)
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S_')
        filename = timestamp + filename
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        
        return jsonify({
            'success': True,
            'filename': filename,
            'message': 'File uploaded successfully'
        }), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/analyze', methods=['POST'])
def analyze_image():
    """Analyze uploaded medical image"""
    try:
        data = request.get_json()
        filename = data.get('filename')
        
        if not filename:
            return jsonify({'error': 'No filename provided'}), 400
        
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        
        if not os.path.exists(filepath):
            return jsonify({'error': 'File not found'}), 404
        
        # Process the image
        img = Image.open(filepath)
        img_array = np.array(img)
        
        analysis_result = {
            'filename': filename,
            'timestamp': datetime.now().isoformat(),
            'image_info': {
                'width': img.width,
                'height': img.height,
                'format': img.format,
                'mode': img.mode
            },
            'statistics': {
                'mean': float(np.mean(img_array)),
                'std': float(np.std(img_array)),
                'min': float(np.min(img_array)),
                'max': float(np.max(img_array))
            },
            'status': 'Analysis complete'
        }
        
        return jsonify(analysis_result), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/generate-report', methods=['POST'])
def generate_report():
    """Generate PDF report"""
    try:
        data = request.get_json()
        filename = data.get('filename')
        analysis = data.get('analysis')
        
        # Create a simple text report
        report_content = f"""
Medical Image Analysis Report
Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

File: {filename}
Image Dimensions: {analysis['image_info']['width']}x{analysis['image_info']['height']}
Format: {analysis['image_info']['format']}

Statistics:
- Mean Value: {analysis['statistics']['mean']:.2f}
- Std Deviation: {analysis['statistics']['std']:.2f}
- Min Value: {analysis['statistics']['min']:.2f}
- Max Value: {analysis['statistics']['max']:.2f}

Status: {analysis['status']}
"""
        
        return jsonify({
            'success': True,
            'report': report_content,
            'message': 'Report generated successfully'
        }), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/history', methods=['GET'])
def get_history():
    """Get upload history"""
    try:
        files = []
        for filename in os.listdir(app.config['UPLOAD_FOLDER']):
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            if os.path.isfile(filepath):
                files.append({
                    'filename': filename,
                    'size': os.path.getsize(filepath),
                    'modified': datetime.fromtimestamp(os.path.getmtime(filepath)).isoformat()
                })
        
        return jsonify({'files': sorted(files, key=lambda x: x['modified'], reverse=True)}), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'timestamp': datetime.now().isoformat()}), 200

if __name__ == '__main__':
    # For development
    app.run(host='0.0.0.0', port=5000, debug=False)
