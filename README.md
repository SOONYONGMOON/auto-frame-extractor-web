# Auto Frame Extractor - Web Version

**by Wombat Soft**

A powerful web application for intelligent frame extraction from videos using advanced image quality analysis. Works entirely in your browser without any installation or server requirements.

## 🌟 Features

### Core Functionality
- **Browser-Based Processing**: No installation required - works entirely in your web browser
- **Native Drag & Drop**: Perfect drag and drop support for video files
- **Client-Side Processing**: All video processing happens locally on your device
- **Privacy First**: No data sent to servers - everything stays on your device
- **Smart Frame Extraction**: Extract frames at customizable intervals (0.1s to 10.0s)
- **Dual Processing Modes**: 
  - Simple extraction mode (keeps all frames)
  - Intelligent quality scoring mode with thumbnail selection

### Advanced Image Quality Analysis
- **Comprehensive Scoring System**: 100-point quality assessment
- **Multiple Quality Criteria**:
  - **Sharpness (30 points)**: Uses Laplacian variance for focus quality detection
  - **Brightness (25 points)**: Optimal exposure analysis for well-lit images
  - **Contrast (25 points)**: Dynamic range measurement for visual clarity
  - **Composition (20 points)**: Visual balance using edge density analysis

### Web-Specific Features
- **Instant Download**: Download individual frames or bulk ZIP files
- **Visual Preview**: See all extracted frames with quality scores
- **Real-time Progress**: Live progress tracking during processing
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **No Server Required**: Can be run locally or hosted anywhere

## 📋 System Requirements

### Browser Compatibility
- **Chrome**: Version 94+ (recommended)
- **Firefox**: Version 95+
- **Safari**: Version 15+
- **Edge**: Version 94+

### System Requirements
- **Memory**: 4GB RAM minimum (8GB recommended for large videos)
- **Storage**: Sufficient space for extracted frames
- **Internet**: Required only for initial load (downloads FFmpeg WebAssembly)

## 🚀 Getting Started

### Option 1: Run Locally
1. Download the web version files
2. Open `index.html` in a modern web browser
3. Wait for FFmpeg WebAssembly to load (first time only)
4. Start extracting frames!

### Option 2: Serve via Web Server
```bash
# Using Python
python -m http.server 8000

# Using Node.js
npx serve .

# Using PHP
php -S localhost:8000
```

Then open `http://localhost:8000` in your browser.

## 📖 How to Use

### 1. Load Your Video
- **Drag & Drop**: Simply drag a video file onto the application
- **Click to Browse**: Click the drop zone to open file browser
- **Supported Formats**: MP4, MOV, AVI, MKV, WebM

### 2. Configure Settings

#### Frame Interval
- **Range**: 0.1 seconds to 10.0 seconds
- **Purpose**: How frequently frames are extracted
- **Example**: 2.0s interval = one frame every 2 seconds

#### Quality Scoring
- **ON**: Enables intelligent thumbnail selection with quality analysis
- **OFF**: Simple extraction mode (keeps all frames without analysis)

#### Keep Top Frames (Quality Mode Only)
- **Range**: 1% to 20%
- **Purpose**: Percentage of highest-scoring frames to highlight
- **Default**: 10%

### 3. Process Your Video

1. Click "Start Processing"
2. Monitor real-time progress
3. View extracted frames with quality scores
4. Download individual frames or bulk ZIP files

### 4. Download Results

#### Download Options
- **Download All**: Get all extracted frames as ZIP
- **Download Top Rated**: Get only the highest-scoring frames as ZIP
- **Individual Download**: Click any frame to download it separately

#### File Naming
```
001_MyVideo_5.0s_score85.png    (Frame 1 at 5.0s with score 85/100)
002_MyVideo_7.5s_score72.png    (Frame 2 at 7.5s with score 72/100)
```

## 🔧 Technical Details

### Processing Pipeline
1. **Video Loading**: File loaded into browser memory
2. **FFmpeg Processing**: WebAssembly-based frame extraction
3. **Quality Analysis**: Client-side image processing algorithms
4. **Scoring**: 100-point quality assessment per frame
5. **Results**: Visual preview and download preparation

### Quality Scoring Algorithm

#### Sharpness Analysis (30 points)
- **Method**: Laplacian variance edge detection
- **Purpose**: Measures focus and image clarity
- **Optimal**: High edge contrast indicates sharp focus

#### Brightness Analysis (25 points)
- **Method**: RGB to luminance conversion
- **Optimal Range**: 50-200 brightness levels
- **Purpose**: Ensures well-exposed images

#### Contrast Analysis (25 points)
- **Method**: Standard deviation of pixel brightness
- **Purpose**: Measures dynamic range and visual clarity
- **Higher contrast = Higher score**

#### Composition Analysis (20 points)
- **Method**: Edge density calculation
- **Purpose**: Evaluates visual interest and balance
- **Optimal**: 5-15% edge density for best composition

### Performance Characteristics
- **Processing Speed**: 1-3 frames per second (varies by device)
- **Memory Usage**: ~500MB-2GB during processing (depends on video size)
- **First Load**: ~10-20MB download for FFmpeg WebAssembly (cached afterward)

## 🌐 Web vs Desktop Comparison

| Feature | Web Version | Desktop Version |
|---------|-------------|-----------------|
| Installation | None required | Download & install |
| Drag & Drop | ✅ Perfect support | ⚠️ Limited in newer Electron |
| Processing Speed | Good (WebAssembly) | Excellent (native) |
| File Size Limits | Browser dependent | No limits |
| Offline Use | ✅ After first load | ✅ Always |
| Auto-updates | ✅ Always latest | Manual updates |
| Cross-platform | ✅ Any modern browser | macOS/Windows only |

## 🔒 Privacy & Security

### Local Processing
- **No Server Communication**: All processing happens in your browser
- **No Data Upload**: Your videos never leave your device
- **No Analytics**: No tracking or usage data collected
- **No Account Required**: Use anonymously

### Data Handling
- **Temporary Storage**: Videos processed in browser memory only
- **No Persistence**: Nothing saved unless you download it
- **Secure Context**: Runs in browser security sandbox

## 🛠️ Troubleshooting

### Common Issues

**1. "Loading Video Processor" stuck**
- Check internet connection for initial FFmpeg download
- Try refreshing the page
- Ensure you're using a supported browser

**2. "Invalid file type" error**
- Use supported formats: MP4, MOV, AVI, MKV, WebM
- Check file isn't corrupted
- Try converting to MP4 if issues persist

**3. Processing very slow**
- Use shorter videos for testing
- Increase frame interval (extract fewer frames)
- Close other browser tabs to free memory
- Try a different browser

**4. Browser crashes or freezes**
- Video file too large for available memory
- Try with smaller/shorter videos
- Restart browser and try again

### Performance Tips
- **Optimal Video Size**: Under 100MB for best performance
- **Recommended Settings**: 2-5 second intervals with 10% top frames
- **Browser Choice**: Chrome generally performs best
- **Memory**: Close other applications for large video processing

## 🔄 Browser Storage

### What's Stored
- **Settings**: Your slider preferences and toggle states
- **FFmpeg Cache**: WebAssembly modules (for faster subsequent loads)
- **Nothing Else**: No videos, frames, or personal data stored

### Clear Data
To reset the application:
1. Open browser developer tools (F12)
2. Go to Application/Storage tab
3. Clear all storage for the site
4. Refresh the page

## 📱 Mobile Support

### Supported Devices
- **iOS Safari**: iPhone/iPad with iOS 15+
- **Android Chrome**: Android 10+ devices
- **Limitations**: Smaller memory limits, slower processing

### Mobile Tips
- Use shorter videos (under 30 seconds)
- Increase frame intervals (3-5 seconds)
- Process in landscape mode for better UI
- Ensure stable power connection

## 🚀 Advanced Usage

### Custom Hosting
The web version can be hosted on any static web server:
- GitHub Pages
- Netlify
- Vercel
- Apache/Nginx
- AWS S3 + CloudFront

### Integration
Embed in other applications:
```html
<iframe src="path/to/auto-frame-extractor/index.html" 
        width="100%" height="800px">
</iframe>
```

## 📊 Comparison with Desktop Version

### Advantages of Web Version
- ✅ **No Installation**: Works immediately in browser
- ✅ **Perfect Drag & Drop**: Native browser support
- ✅ **Cross-Platform**: Works on any OS with modern browser
- ✅ **Always Updated**: Latest version automatically
- ✅ **Portable**: Can run from USB drive or any hosting

### Advantages of Desktop Version
- ✅ **Better Performance**: Native processing is faster
- ✅ **Larger Files**: No browser memory limitations
- ✅ **Offline First**: No internet required after installation
- ✅ **System Integration**: Better file system access

## 📄 License

MIT License - Use freely for personal and commercial projects.

## 🤝 Support & Contributing

### Getting Help
1. Check the troubleshooting section above
2. Try with a smaller test video file
3. Ensure you're using a supported browser
4. Check browser console for error messages

### Reporting Issues
When reporting problems, please include:
- Browser name and version
- Operating system
- Video file format and size
- Steps to reproduce the issue
- Any console error messages

### Contributing
The web version is built with:
- **Vanilla JavaScript**: No frameworks required
- **FFmpeg.wasm**: WebAssembly video processing
- **Tailwind CSS**: Utility-first styling
- **JSZip**: Client-side ZIP file creation

## 🙏 Acknowledgments

**Developed by Wombat Soft**

Special thanks to:
- **FFmpeg.wasm**: Bringing powerful video processing to the web
- **JSZip**: Enabling client-side file compression
- **Tailwind CSS**: Beautiful, responsive design system
- **WebAssembly**: Making native performance possible in browsers

---

**Auto Frame Extractor Web Version** - Intelligent video frame extraction, anywhere you have a browser! 🎬✨