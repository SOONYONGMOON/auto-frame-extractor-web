// Auto Frame Extractor - Web Version
// by Wombat Soft

class AutoFrameExtractor {
    constructor() {
        this.ffmpeg = null;
        this.selectedVideo = null;
        this.extractedFrames = [];
        this.isProcessing = false;
        this.processingCancelled = false;
        
        this.init();
    }
    
    async init() {
        console.log('=== AUTO FRAME EXTRACTOR WEB VERSION ===');
        
        try {
            // Initialize FFmpeg
            await this.initFFmpeg();
            
            // Setup UI handlers
            this.setupHandlers();
            
            // Hide loading screen
            document.getElementById('ffmpeg-loading').style.display = 'none';
            
            if (this.ffmpeg) {
                this.showNotification('✅ Auto Frame Extractor ready! Full FFmpeg processing available.');
            } else {
                this.showNotification('✅ Auto Frame Extractor ready! Using HTML5 video processing (works great for MP4/WebM files).');
            }
            
        } catch (error) {
            console.error('Initialization failed:', error);
            this.showNotification('❌ Failed to initialize video processor. Please refresh the page.');
        }
    }
    
    async initFFmpeg() {
        console.log('Loading FFmpeg WebAssembly...');
        
        try {
            this.ffmpeg = new FFmpeg.FFmpeg();
            
            // Set up logging
            this.ffmpeg.on('log', ({ message }) => {
                console.log('[FFmpeg]', message);
            });
            
            this.ffmpeg.on('progress', ({ progress, time }) => {
                if (this.isProcessing) {
                    // Update progress from FFmpeg
                    const percent = Math.round(progress * 100);
                    console.log(`FFmpeg progress: ${percent}%`);
                }
            });
            
            // Try multiple CDN sources for better reliability
            const cdnSources = [
                'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd',
                'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.6/dist/umd',
                'https://unpkg.com/@ffmpeg/core@0.12.4/dist/umd'
            ];
            
            let loaded = false;
            for (const baseURL of cdnSources) {
                try {
                    console.log(`Trying to load FFmpeg from: ${baseURL}`);
                    
                    await this.ffmpeg.load({
                        coreURL: await FFmpeg.toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
                        wasmURL: await FFmpeg.toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
                    });
                    
                    loaded = true;
                    console.log('✅ FFmpeg loaded successfully from:', baseURL);
                    break;
                } catch (error) {
                    console.warn(`Failed to load from ${baseURL}:`, error.message);
                    continue;
                }
            }
            
            if (!loaded) {
                throw new Error('Failed to load FFmpeg from all CDN sources');
            }
            
        } catch (error) {
            console.error('FFmpeg initialization failed:', error);
            // Fall back to canvas-only mode
            this.ffmpeg = null;
            console.log('Falling back to canvas-only frame extraction mode');
        }
    }
    
    setupHandlers() {
        console.log('Setting up UI handlers...');
        
        // Drag and drop
        this.setupDragAndDrop();
        
        // File input
        const fileInput = document.getElementById('file-input');
        const dropZone = document.getElementById('drop-zone');
        
        dropZone.addEventListener('click', () => {
            fileInput.click();
        });
        
        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                this.handleVideoFile(e.target.files[0]);
            }
        });
        
        // Sliders
        this.setupSliders();
        
        // Quality toggle
        this.setupQualityToggle();
        
        // Processing buttons
        document.getElementById('start-processing').addEventListener('click', () => {
            this.startProcessing();
        });
        
        document.getElementById('cancel-processing').addEventListener('click', () => {
            this.cancelProcessing();
        });
        
        // Download buttons
        document.getElementById('download-all').addEventListener('click', () => {
            this.downloadFrames('all');
        });
        
        document.getElementById('download-top').addEventListener('click', () => {
            this.downloadFrames('top');
        });
        
        console.log('✅ UI handlers setup complete');
    }
    
    setupDragAndDrop() {
        const dropZone = document.getElementById('drop-zone');
        
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
            });
        });
        
        ['dragenter', 'dragover'].forEach(eventName => {
            dropZone.addEventListener(eventName, () => {
                dropZone.classList.add('drag-over');
            });
        });
        
        ['dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, () => {
                dropZone.classList.remove('drag-over');
            });
        });
        
        dropZone.addEventListener('drop', (e) => {
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                this.handleVideoFile(files[0]);
            }
        });
    }
    
    setupSliders() {
        // Frame interval slider
        const intervalSlider = document.getElementById('frame-interval');
        const intervalValue = document.getElementById('frame-interval-value');
        
        intervalSlider.addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            const seconds = (value / 10).toFixed(1);
            intervalValue.textContent = `${seconds}s`;
        });
        
        // Top frames percentage slider
        const topFramesSlider = document.getElementById('top-frames-percentage');
        const topFramesValue = document.getElementById('top-frames-percentage-value');
        
        topFramesSlider.addEventListener('input', (e) => {
            const percentage = parseInt(e.target.value);
            topFramesValue.textContent = `${percentage}%`;
        });
    }
    
    setupQualityToggle() {
        const qualityToggle = document.getElementById('quality-scoring-toggle');
        const statusSpan = document.getElementById('quality-toggle-status');
        const qualityInfo = document.getElementById('quality-scoring-info');
        const simpleInfo = document.getElementById('simple-mode-info');
        
        qualityToggle.addEventListener('change', (e) => {
            const isEnabled = e.target.checked;
            statusSpan.textContent = isEnabled ? 'ON' : 'OFF';
            statusSpan.className = isEnabled 
                ? 'ml-3 text-sm font-medium text-blue-600 dark:text-blue-400'
                : 'ml-3 text-sm font-medium text-gray-600 dark:text-gray-400';
            
            if (isEnabled) {
                qualityInfo.classList.remove('hidden');
                simpleInfo.classList.add('hidden');
            } else {
                qualityInfo.classList.add('hidden');
                simpleInfo.classList.remove('hidden');
            }
        });
    }
    
    async handleVideoFile(file) {
        console.log('Handling video file:', file.name);
        
        // Validate file type
        const validTypes = ['video/mp4', 'video/mov', 'video/avi', 'video/mkv', 'video/webm'];
        if (!validTypes.includes(file.type) && !this.isValidVideoExtension(file.name)) {
            this.showNotification('❌ Invalid file type. Please use MP4, MOV, AVI, MKV, or WebM files.');
            return;
        }
        
        this.selectedVideo = file;
        
        // Update UI
        this.updateVideoDisplay(file);
        
        // Get video info
        try {
            const videoInfo = await this.getVideoInfo(file);
            this.displayVideoInfo(videoInfo);
            
            // Enable processing button
            document.getElementById('start-processing').disabled = false;
            
            this.showNotification(`✅ Video loaded: ${file.name}`);
            
        } catch (error) {
            console.error('Error getting video info:', error);
            this.showNotification('⚠️ Video loaded but could not read metadata. You can still try processing.');
            document.getElementById('start-processing').disabled = false;
        }
    }
    
    isValidVideoExtension(filename) {
        const validExtensions = ['.mp4', '.mov', '.avi', '.mkv', '.webm'];
        const extension = filename.toLowerCase().substring(filename.lastIndexOf('.'));
        return validExtensions.includes(extension);
    }
    
    async getVideoInfo(file) {
        return new Promise((resolve, reject) => {
            const video = document.createElement('video');
            video.preload = 'metadata';
            
            video.onloadedmetadata = () => {
                resolve({
                    duration: video.duration,
                    width: video.videoWidth,
                    height: video.videoHeight
                });
                video.remove();
            };
            
            video.onerror = () => {
                reject(new Error('Could not load video metadata'));
                video.remove();
            };
            
            video.src = URL.createObjectURL(file);
        });
    }
    
    updateVideoDisplay(file) {
        const selectedVideo = document.getElementById('selected-video');
        const videoName = document.getElementById('video-name');
        const videoSize = document.getElementById('video-size');
        
        videoName.textContent = file.name;
        videoSize.textContent = this.formatFileSize(file.size);
        selectedVideo.classList.remove('hidden');
    }
    
    displayVideoInfo(info) {
        const videoInfoDiv = document.getElementById('video-info');
        const duration = this.formatDuration(info.duration);
        const resolution = `${info.width}x${info.height}`;
        
        videoInfoDiv.innerHTML = `
            <div>Duration: ${duration}</div>
            <div>Resolution: ${resolution}</div>
        `;
    }
    
    async startProcessing() {
        if (!this.selectedVideo) {
            this.showNotification('Please select a video file first.');
            return;
        }
        
        console.log('Starting video processing...');
        
        this.isProcessing = true;
        this.processingCancelled = false;
        this.extractedFrames = [];
        
        // Show progress section
        document.getElementById('progress-section').classList.remove('hidden');
        document.getElementById('results-section').classList.add('hidden');
        
        // Disable start button
        document.getElementById('start-processing').disabled = true;
        
        try {
            // Get settings
            const frameInterval = this.getFrameInterval();
            const qualityScoring = document.getElementById('quality-scoring-toggle').checked;
            const topFramesPercentage = parseInt(document.getElementById('top-frames-percentage').value);
            
            console.log(`Processing settings: interval=${frameInterval}s, quality=${qualityScoring}, top=${topFramesPercentage}%`);
            
            // Process video
            await this.processVideo(frameInterval, qualityScoring, topFramesPercentage);
            
            if (!this.processingCancelled) {
                this.showResults();
                this.showNotification('✅ Processing completed successfully!');
            }
            
        } catch (error) {
            console.error('Processing failed:', error);
            this.showNotification(`❌ Processing failed: ${error.message}`);
        } finally {
            this.isProcessing = false;
            document.getElementById('start-processing').disabled = false;
            document.getElementById('progress-section').classList.add('hidden');
        }
    }
    
    async processVideo(frameInterval, qualityScoring, topFramesPercentage) {
        if (this.ffmpeg) {
            console.log('Processing video with FFmpeg...');
            return await this.processVideoWithFFmpeg(frameInterval, qualityScoring, topFramesPercentage);
        } else {
            console.log('Processing video with HTML5 Canvas fallback...');
            return await this.processVideoWithHTML5(frameInterval, qualityScoring, topFramesPercentage);
        }
    }
    
    async processVideoWithFFmpeg(frameInterval, qualityScoring, topFramesPercentage) {
        // Load video file into FFmpeg
        const videoData = new Uint8Array(await this.selectedVideo.arrayBuffer());
        await this.ffmpeg.writeFile('input.mp4', videoData);
        
        // Get video duration
        const videoInfo = await this.getVideoInfo(this.selectedVideo);
        const totalSeconds = Math.floor(videoInfo.duration);
        const totalFrames = Math.floor(totalSeconds / frameInterval);
        
        this.updateProgress(0, 0, totalFrames, 'Extracting frames with FFmpeg...');
        
        const frames = [];
        let frameIndex = 0;
        
        // Extract frames at intervals
        for (let time = 0; time < totalSeconds && !this.processingCancelled; time += frameInterval) {
            if (this.processingCancelled) break;
            
            try {
                // Extract frame at specific time
                const frameFilename = `frame_${String(frameIndex).padStart(4, '0')}.png`;
                
                await this.ffmpeg.exec([
                    '-i', 'input.mp4',
                    '-ss', time.toString(),
                    '-vframes', '1',
                    '-f', 'image2',
                    frameFilename
                ]);
                
                // Read the extracted frame
                const frameData = await this.ffmpeg.readFile(frameFilename);
                const frameBlob = new Blob([frameData], { type: 'image/png' });
                const frameUrl = URL.createObjectURL(frameBlob);
                
                const frame = {
                    index: frameIndex,
                    time: time,
                    filename: frameFilename,
                    url: frameUrl,
                    blob: frameBlob,
                    score: 0
                };
                
                // Calculate quality score if enabled
                if (qualityScoring) {
                    frame.score = await this.calculateQualityScore(frameBlob);
                    console.log(`Frame ${frameIndex} (${time}s): Score ${frame.score.toFixed(1)}/100`);
                } else {
                    frame.score = 50; // Default score for simple mode
                }
                
                frames.push(frame);
                frameIndex++;
                
                // Update progress
                const progress = (frameIndex / totalFrames) * 100;
                this.updateProgress(progress, frameIndex, totalFrames, `Processing frame ${frameIndex}/${totalFrames}...`);
                
                // Clean up FFmpeg file
                try {
                    await this.ffmpeg.deleteFile(frameFilename);
                } catch (e) {
                    // Ignore cleanup errors
                }
                
            } catch (error) {
                console.error(`Error extracting frame at ${time}s:`, error);
            }
        }
        
        // Store results
        this.extractedFrames = frames;
        
        // Sort by quality score if quality scoring is enabled
        if (qualityScoring) {
            this.extractedFrames.sort((a, b) => b.score - a.score);
            console.log(`Quality scoring results: ${frames.length} frames processed, top score: ${this.extractedFrames[0]?.score.toFixed(1)}`);
        }
        
        // Clean up FFmpeg
        try {
            await this.ffmpeg.deleteFile('input.mp4');
        } catch (e) {
            // Ignore cleanup errors
        }
    }
    
    async processVideoWithHTML5(frameInterval, qualityScoring, topFramesPercentage) {
        return new Promise((resolve, reject) => {
            const video = document.createElement('video');
            video.preload = 'metadata';
            video.muted = true;
            
            video.onloadedmetadata = async () => {
                try {
                    const totalSeconds = Math.floor(video.duration);
                    const totalFrames = Math.floor(totalSeconds / frameInterval);
                    
                    console.log(`HTML5 processing: ${totalSeconds}s duration, ${totalFrames} frames at ${frameInterval}s intervals`);
                    
                    this.updateProgress(0, 0, totalFrames, 'Extracting frames with HTML5...');
                    
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    
                    canvas.width = video.videoWidth;
                    canvas.height = video.videoHeight;
                    
                    const frames = [];
                    let frameIndex = 0;
                    
                    const extractFrame = async (time) => {
                        return new Promise((resolveFrame) => {
                            video.currentTime = time;
                            
                            const onSeeked = async () => {
                                video.removeEventListener('seeked', onSeeked);
                                
                                try {
                                    // Draw video frame to canvas
                                    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                                    
                                    // Convert canvas to blob
                                    canvas.toBlob(async (blob) => {
                                        const frameUrl = URL.createObjectURL(blob);
                                        
                                        const frame = {
                                            index: frameIndex,
                                            time: time,
                                            filename: `frame_${String(frameIndex).padStart(4, '0')}.png`,
                                            url: frameUrl,
                                            blob: blob,
                                            score: 0
                                        };
                                        
                                        // Calculate quality score if enabled
                                        if (qualityScoring) {
                                            frame.score = await this.calculateQualityScore(blob);
                                            console.log(`Frame ${frameIndex} (${time}s): Score ${frame.score.toFixed(1)}/100`);
                                        } else {
                                            frame.score = 50; // Default score for simple mode
                                        }
                                        
                                        frames.push(frame);
                                        frameIndex++;
                                        
                                        // Update progress
                                        const progress = (frameIndex / totalFrames) * 100;
                                        this.updateProgress(progress, frameIndex, totalFrames, `Processing frame ${frameIndex}/${totalFrames}...`);
                                        
                                        resolveFrame();
                                    }, 'image/png');
                                    
                                } catch (error) {
                                    console.error(`Error extracting frame at ${time}s:`, error);
                                    resolveFrame();
                                }
                            };
                            
                            video.addEventListener('seeked', onSeeked);
                        });
                    };
                    
                    // Extract frames sequentially
                    for (let time = 0; time < totalSeconds && !this.processingCancelled; time += frameInterval) {
                        if (this.processingCancelled) break;
                        await extractFrame(time);
                    }
                    
                    // Store results
                    this.extractedFrames = frames;
                    
                    // Sort by quality score if quality scoring is enabled
                    if (qualityScoring) {
                        this.extractedFrames.sort((a, b) => b.score - a.score);
                        console.log(`Quality scoring results: ${frames.length} frames processed, top score: ${this.extractedFrames[0]?.score.toFixed(1)}`);
                    }
                    
                    // Cleanup
                    canvas.remove();
                    video.remove();
                    
                    resolve();
                    
                } catch (error) {
                    video.remove();
                    reject(error);
                }
            };
            
            video.onerror = () => {
                video.remove();
                reject(new Error('Failed to load video for HTML5 processing'));
            };
            
            video.src = URL.createObjectURL(this.selectedVideo);
        });
    }
    
    async calculateQualityScore(frameBlob) {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);
                
                const imageData = ctx.getImageData(0, 0, img.width, img.height);
                const score = this.analyzeImageQuality(imageData, img.width, img.height);
                
                canvas.remove();
                img.remove();
                resolve(score);
            };
            img.src = URL.createObjectURL(frameBlob);
        });
    }
    
    analyzeImageQuality(imageData, width, height) {
        const data = imageData.data;
        
        // Sharpness (30 points) - Laplacian variance
        const sharpness = this.calculateSharpness(data, width, height);
        const sharpnessScore = Math.min(30, (sharpness / 1000) * 30);
        
        // Brightness (25 points) - optimal range
        const brightness = this.calculateBrightness(data);
        const brightnessScore = brightness >= 50 && brightness <= 200 ? 25 : 
            Math.max(0, 25 - Math.abs(brightness - 125) / 5);
        
        // Contrast (25 points) - standard deviation
        const contrast = this.calculateContrast(data);
        const contrastScore = Math.min(25, (contrast / 50) * 25);
        
        // Composition (20 points) - edge density
        const composition = this.calculateComposition(data, width, height);
        const compositionScore = composition * 20;
        
        const totalScore = sharpnessScore + brightnessScore + contrastScore + compositionScore;
        
        return Math.min(100, totalScore);
    }
    
    calculateSharpness(data, width, height) {
        // Convert to grayscale and calculate Laplacian variance
        const gray = new Array(width * height);
        
        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            gray[i / 4] = 0.299 * r + 0.587 * g + 0.114 * b;
        }
        
        let variance = 0;
        let count = 0;
        
        for (let y = 1; y < height - 1; y++) {
            for (let x = 1; x < width - 1; x++) {
                const i = y * width + x;
                const laplacian = -4 * gray[i] + 
                                gray[i - 1] + gray[i + 1] + 
                                gray[i - width] + gray[i + width];
                variance += laplacian * laplacian;
                count++;
            }
        }
        
        return count > 0 ? variance / count : 0;
    }
    
    calculateBrightness(data) {
        let sum = 0;
        const pixelCount = data.length / 4;
        
        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            sum += 0.299 * r + 0.587 * g + 0.114 * b;
        }
        
        return sum / pixelCount;
    }
    
    calculateContrast(data) {
        let sum = 0;
        let sumSquared = 0;
        const pixelCount = data.length / 4;
        
        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            const brightness = 0.299 * r + 0.587 * g + 0.114 * b;
            
            sum += brightness;
            sumSquared += brightness * brightness;
        }
        
        const mean = sum / pixelCount;
        const variance = (sumSquared / pixelCount) - (mean * mean);
        
        return Math.sqrt(variance);
    }
    
    calculateComposition(data, width, height) {
        // Simple edge density calculation
        let edgeCount = 0;
        const threshold = 50;
        
        for (let y = 1; y < height - 1; y++) {
            for (let x = 1; x < width - 1; x++) {
                const i = (y * width + x) * 4;
                const current = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
                
                const right = 0.299 * data[i + 4] + 0.587 * data[i + 5] + 0.114 * data[i + 6];
                const below = 0.299 * data[i + width * 4] + 0.587 * data[i + width * 4 + 1] + 0.114 * data[i + width * 4 + 2];
                
                const gradientMagnitude = Math.sqrt(
                    Math.pow(current - right, 2) + Math.pow(current - below, 2)
                );
                
                if (gradientMagnitude > threshold) {
                    edgeCount++;
                }
            }
        }
        
        const totalPixels = (width - 2) * (height - 2);
        const edgeDensity = edgeCount / totalPixels;
        
        // Optimal edge density is around 5-15%
        if (edgeDensity >= 0.05 && edgeDensity <= 0.15) {
            return 1.0;
        } else if (edgeDensity < 0.05) {
            return edgeDensity / 0.05;
        } else {
            return Math.max(0, 1 - (edgeDensity - 0.15) / 0.1);
        }
    }
    
    getFrameInterval() {
        const value = parseInt(document.getElementById('frame-interval').value);
        return value / 10; // Convert to decimal (0.1-10.0)
    }
    
    updateProgress(percentage, current, total, status) {
        document.getElementById('progress-percentage').textContent = `${Math.round(percentage)}%`;
        document.getElementById('progress-bar').style.width = `${percentage}%`;
        document.getElementById('current-frame').textContent = `Frame ${current}`;
        document.getElementById('total-frames-label').textContent = `Total: ${total}`;
        document.getElementById('processing-status').textContent = status;
    }
    
    cancelProcessing() {
        this.processingCancelled = true;
        this.showNotification('Processing cancelled');
    }
    
    showResults() {
        const resultsSection = document.getElementById('results-section');
        const framesGrid = document.getElementById('frames-grid');
        
        // Clear previous results
        framesGrid.innerHTML = '';
        
        // Add frames to grid
        this.extractedFrames.forEach((frame, index) => {
            const frameElement = this.createFrameElement(frame, index);
            framesGrid.appendChild(frameElement);
        });
        
        resultsSection.classList.remove('hidden');
    }
    
    createFrameElement(frame, index) {
        const div = document.createElement('div');
        div.className = 'relative group cursor-pointer';
        
        div.innerHTML = `
            <img src="${frame.url}" 
                 alt="Frame ${frame.index}" 
                 class="w-full h-24 object-cover rounded-lg border-2 border-gray-200 hover:border-blue-400 transition-colors">
            <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity rounded-lg flex items-center justify-center">
                <div class="text-white text-xs opacity-0 group-hover:opacity-100 text-center">
                    <div>Frame ${frame.index}</div>
                    <div>${frame.time.toFixed(1)}s</div>
                    <div>Score: ${frame.score.toFixed(1)}</div>
                </div>
            </div>
        `;
        
        div.addEventListener('click', () => {
            this.downloadSingleFrame(frame);
        });
        
        return div;
    }
    
    async downloadFrames(type) {
        const qualityScoring = document.getElementById('quality-scoring-toggle').checked;
        const topFramesPercentage = parseInt(document.getElementById('top-frames-percentage').value);
        
        let framesToDownload = [];
        
        if (type === 'all') {
            framesToDownload = this.extractedFrames;
        } else if (type === 'top' && qualityScoring) {
            const keepCount = Math.max(1, Math.ceil(this.extractedFrames.length * (topFramesPercentage / 100)));
            framesToDownload = this.extractedFrames.slice(0, keepCount);
        } else {
            framesToDownload = this.extractedFrames;
        }
        
        if (framesToDownload.length === 0) {
            this.showNotification('No frames to download');
            return;
        }
        
        // Create zip file
        this.showNotification(`Preparing ${framesToDownload.length} frames for download...`);
        
        try {
            const zip = new JSZip();
            
            for (let i = 0; i < framesToDownload.length; i++) {
                const frame = framesToDownload[i];
                const filename = `${String(i + 1).padStart(3, '0')}_${this.selectedVideo.name.split('.')[0]}_${frame.time.toFixed(1)}s_score${Math.round(frame.score)}.png`;
                
                const arrayBuffer = await frame.blob.arrayBuffer();
                zip.file(filename, arrayBuffer);
            }
            
            const zipBlob = await zip.generateAsync({ type: 'blob' });
            const downloadUrl = URL.createObjectURL(zipBlob);
            
            const a = document.createElement('a');
            a.href = downloadUrl;
            a.download = `frames_${this.selectedVideo.name.split('.')[0]}_${type}.zip`;
            a.click();
            
            URL.revokeObjectURL(downloadUrl);
            this.showNotification(`✅ Downloaded ${framesToDownload.length} frames`);
            
        } catch (error) {
            console.error('Download failed:', error);
            this.showNotification('❌ Download failed. Please try again.');
        }
    }
    
    downloadSingleFrame(frame) {
        const a = document.createElement('a');
        a.href = frame.url;
        a.download = `frame_${String(frame.index).padStart(3, '0')}_${frame.time.toFixed(1)}s_score${Math.round(frame.score)}.png`;
        a.click();
    }
    
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    formatDuration(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);
        
        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        } else {
            return `${minutes}:${secs.toString().padStart(2, '0')}`;
        }
    }
    
    showNotification(message) {
        console.log('NOTIFICATION:', message);
        
        // Create notification element
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg z-50 max-w-sm';
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Remove after 4 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 4000);
    }
}

// Add JSZip library
const script = document.createElement('script');
script.src = 'https://unpkg.com/jszip@3.10.1/dist/jszip.min.js';
script.onload = () => {
    // Initialize the application when everything is loaded
    window.app = new AutoFrameExtractor();
};
document.head.appendChild(script);