// State management
let stream = null;
let photos = [];
let currentPhotoIndex = 0;
let backgroundColor = '#ffffff';
let borderColor = '#ffffff';
const totalPhotos = 4;

// DOM elements
const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const stripCanvas = document.getElementById('strip-canvas');
const captureBtn = document.getElementById('capture-btn');
const resetBtn = document.getElementById('reset-btn');
const downloadBtn = document.getElementById('download-btn');
const shareBtn = document.getElementById('share-btn');
const newStripBtn = document.getElementById('new-strip-btn');
const cameraSection = document.getElementById('camera-section');
const stripSection = document.getElementById('strip-section');
const errorMessage = document.getElementById('error-message');
const backgroundColorInput = document.getElementById('background-color');
const borderColorInput = document.getElementById('border-color');
const backgroundPresets = document.querySelectorAll('#background-presets .color-preset');
const borderPresets = document.querySelectorAll('#border-presets .color-preset');
const countdownOverlay = document.getElementById('countdown-overlay');
const countdownNumber = document.getElementById('countdown-number');
const shareMessageInput = document.getElementById('share-message');

// Initialize camera
async function initCamera() {
    try {
        stream = await navigator.mediaDevices.getUserMedia({
            video: {
                facingMode: 'user',
                width: { ideal: 1280 },
                height: { ideal: 720 }
            }
        });
        video.srcObject = stream;
        captureBtn.disabled = false;
        hideError();
    } catch (error) {
        console.error('Error accessing camera:', error);
        showError('Unable to access camera. Please allow camera permissions and refresh the page.');
        captureBtn.disabled = true;
    }
}

// Start countdown timer
function startCountdown(callback) {
    let count = 3;
    captureBtn.disabled = true;
    countdownOverlay.style.display = 'flex';
    countdownNumber.textContent = count;
    
    const countdownInterval = setInterval(() => {
        count--;
        if (count > 0) {
            countdownNumber.textContent = count;
            // Add pulse animation
            countdownNumber.style.transform = 'scale(1.2)';
            setTimeout(() => {
                countdownNumber.style.transform = 'scale(1)';
            }, 100);
        } else {
            countdownNumber.textContent = '📷';
            clearInterval(countdownInterval);
            setTimeout(() => {
                countdownOverlay.style.display = 'none';
                callback();
                captureBtn.disabled = false;
            }, 300);
        }
    }, 1000);
}

// Actually capture the photo
function actuallyCapturePhoto() {
    if (currentPhotoIndex >= totalPhotos) {
        return;
    }

    const context = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw video frame to canvas (mirrored)
    context.save();
    context.scale(-1, 1);
    context.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
    context.restore();

    // Convert to image data
    const imageData = canvas.toDataURL('image/jpeg', 0.9);
    photos[currentPhotoIndex] = imageData;

    // Display in preview
    const photoElement = document.getElementById(`photo-${currentPhotoIndex + 1}`);
    photoElement.src = imageData;
    photoElement.classList.add('show');
    
    // Mark slot as filled
    const photoSlot = photoElement.parentElement;
    photoSlot.classList.add('filled');

    currentPhotoIndex++;

    // Check if all photos are taken
    if (currentPhotoIndex >= totalPhotos) {
        // Set default color picker state
        backgroundColorInput.value = backgroundColor;
        borderColorInput.value = borderColor;
        backgroundPresets.forEach(preset => {
            if (preset.dataset.color === backgroundColor) {
                preset.classList.add('active');
            } else {
                preset.classList.remove('active');
            }
        });
        borderPresets.forEach(preset => {
            if (preset.dataset.color === borderColor) {
                preset.classList.add('active');
            } else {
                preset.classList.remove('active');
            }
        });
        createStrip();
        cameraSection.style.display = 'none';
        stripSection.style.display = 'flex';
    } else {
        // Brief flash effect
        flashEffect();
    }
}

// Capture photo with countdown
function capturePhoto() {
    if (currentPhotoIndex >= totalPhotos || captureBtn.disabled) {
        return;
    }
    
    startCountdown(actuallyCapturePhoto);
}

// Flash effect
function flashEffect() {
    const flash = document.createElement('div');
    flash.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: white;
        opacity: 0.8;
        z-index: 9999;
        pointer-events: none;
        animation: flash 0.3s ease-out;
    `;
    document.body.appendChild(flash);
    
    setTimeout(() => {
        flash.remove();
    }, 300);
}

// Create photo strip
function createStrip() {
    const stripWidth = 500;
    const borderWidth = 10;
    const spacing = 8;
    const topPadding = 15;
    const bottomPadding = 15;
    const sidePadding = 15;
    
    // Load all images first to get their actual dimensions
    const imagePromises = photos.map((photoData) => {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                resolve({
                    img: img,
                    width: img.width,
                    height: img.height,
                    aspect: img.width / img.height
                });
            };
            img.onerror = () => {
                resolve(null);
            };
            img.src = photoData;
        });
    });

    Promise.all(imagePromises).then((imageData) => {
        const validImages = imageData.filter(data => data !== null);
        if (validImages.length === 0) return;
        
        // Calculate available width for photos (accounting for borders and padding)
        const availableWidth = stripWidth - (sidePadding * 2) - (borderWidth * 2);
        
        // Calculate each photo's display dimensions maintaining their exact aspect ratio
        const photoLayouts = validImages.map((data) => {
            const { img, aspect } = data;
            
            // Fit photo to available width while maintaining aspect ratio
            let photoWidth = availableWidth;
            let photoHeight = photoWidth / aspect;
            
            return {
                img: img,
                width: photoWidth,
                height: photoHeight,
                aspect: aspect
            };
        });
        
        // Calculate total strip height based on actual photo heights
        let currentY = topPadding;
        const photoPositions = photoLayouts.map((layout, index) => {
            const y = currentY;
            currentY += layout.height + spacing;
            return {
                ...layout,
                y: y
            };
        });
        
        const stripHeight = currentY - spacing + bottomPadding;

        // Set canvas dimensions
        stripCanvas.width = stripWidth;
        stripCanvas.height = stripHeight;

        const ctx = stripCanvas.getContext('2d');
        
        // Enable high-quality rendering
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        
        // Fill with selected background color
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, stripWidth, stripHeight);

        // Calculate border area
        const minPhotoWidth = Math.min(...photoLayouts.map(p => p.width));
        const photoAreaX = (stripWidth - minPhotoWidth) / 2 - borderWidth;
        const photoAreaWidth = minPhotoWidth + (borderWidth * 2);
        
        // Draw continuous borders
        ctx.fillStyle = borderColor;
        
        // Top border
        ctx.fillRect(photoAreaX, 0, photoAreaWidth, borderWidth);
        
        // Bottom border
        ctx.fillRect(photoAreaX, stripHeight - borderWidth, photoAreaWidth, borderWidth);
        
        // Left and right vertical borders
        ctx.fillRect(photoAreaX, 0, borderWidth, stripHeight);
        ctx.fillRect(photoAreaX + photoAreaWidth - borderWidth, 0, borderWidth, stripHeight);
        
        // Draw horizontal dividers between photos
        for (let i = 0; i < photoPositions.length - 1; i++) {
            const dividerY = photoPositions[i].y + photoPositions[i].height;
            ctx.fillRect(photoAreaX, dividerY, photoAreaWidth, borderWidth);
        }

        // Draw each photo at its natural aspect ratio
        photoPositions.forEach((photo, index) => {
            const { img, width, height, y } = photo;
            
            // Center photo horizontally
            const x = (stripWidth - width) / 2;
            
            // Draw border around photo
            ctx.fillStyle = borderColor;
            ctx.fillRect(
                x - borderWidth, 
                y - borderWidth, 
                width + (borderWidth * 2), 
                height + (borderWidth * 2)
            );
            
            // Draw photo with shadow
            ctx.save();
            ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
            ctx.shadowBlur = 6;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 2;
            
            // Draw photo at exact dimensions maintaining aspect ratio
            ctx.drawImage(img, x, y, width, height);
            
            ctx.restore();
        });
        
        // Enable buttons once all photos are drawn
        downloadBtn.disabled = false;
        shareBtn.disabled = false;
    });
}

// Update background color
function updateBackgroundColor(color) {
    backgroundColor = color;
    backgroundColorInput.value = color;
    
    // Update active preset
    backgroundPresets.forEach(preset => {
        if (preset.dataset.color === color) {
            preset.classList.add('active');
        } else {
            preset.classList.remove('active');
        }
    });
    
    // Regenerate strip if all photos are taken
    if (photos.length === totalPhotos) {
        createStrip();
    }
}

// Update border color
function updateBorderColor(color) {
    borderColor = color;
    borderColorInput.value = color;
    
    // Update active preset
    borderPresets.forEach(preset => {
        if (preset.dataset.color === color) {
            preset.classList.add('active');
        } else {
            preset.classList.remove('active');
        }
    });
    
    // Regenerate strip if all photos are taken
    if (photos.length === totalPhotos) {
        createStrip();
    }
}

// Download strip
function downloadStrip() {
    stripCanvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `photo-strip-${Date.now()}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, 'image/png');
}

// Share strip
async function shareStrip() {
    try {
        stripCanvas.toBlob(async (blob) => {
            const file = new File([blob], `photo-strip-${Date.now()}.png`, { type: 'image/png' });
            
            // Get custom message or use default
            const customMessage = shareMessageInput.value.trim() || 'Check out my photo strip!';
            
            if (navigator.share && navigator.canShare({ files: [file] })) {
                try {
                    await navigator.share({
                        files: [file],
                        text: customMessage
                    });
                } catch (error) {
                    if (error.name !== 'AbortError') {
                        console.error('Error sharing:', error);
                        // Fallback to download
                        downloadStrip();
                    }
                }
            } else {
                // Fallback: copy to clipboard or download
                if (navigator.clipboard && navigator.clipboard.write) {
                    try {
                        await navigator.clipboard.write([
                            new ClipboardItem({ 'image/png': blob })
                        ]);
                        alert('Photo strip copied to clipboard! You can paste it in iMessage or other apps.');
                    } catch (error) {
                        console.error('Error copying to clipboard:', error);
                        downloadStrip();
                    }
                } else {
                    downloadStrip();
                }
            }
        }, 'image/png');
    } catch (error) {
        console.error('Error sharing:', error);
        downloadStrip();
    }
}

// Reset everything
function reset() {
    // Stop camera stream
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
        stream = null;
    }

    // Reset state
    photos = [];
    currentPhotoIndex = 0;
    backgroundColor = '#ffffff';
    video.srcObject = null;

    // Reset UI
    for (let i = 1; i <= totalPhotos; i++) {
        const photoElement = document.getElementById(`photo-${i}`);
        photoElement.src = '';
        photoElement.classList.remove('show');
        photoElement.parentElement.classList.remove('filled');
    }

    // Reset color pickers
    backgroundColor = '#ffffff';
    borderColor = '#ffffff';
    backgroundColorInput.value = '#ffffff';
    borderColorInput.value = '#ffffff';
    backgroundPresets.forEach(preset => preset.classList.remove('active'));
    borderPresets.forEach(preset => preset.classList.remove('active'));

    // Hide countdown overlay
    countdownOverlay.style.display = 'none';

    // Reset share message
    shareMessageInput.value = '';

    cameraSection.style.display = 'flex';
    stripSection.style.display = 'none';
    captureBtn.disabled = false;
    downloadBtn.disabled = true;
    shareBtn.disabled = true;

    // Reinitialize camera
    initCamera();
}

// Error handling
function showError(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
}

function hideError() {
    errorMessage.style.display = 'none';
}

// Event listeners
captureBtn.addEventListener('click', capturePhoto);
resetBtn.addEventListener('click', reset);
downloadBtn.addEventListener('click', downloadStrip);
shareBtn.addEventListener('click', shareStrip);
newStripBtn.addEventListener('click', reset);

// Color picker events
backgroundColorInput.addEventListener('input', (e) => {
    updateBackgroundColor(e.target.value);
});

backgroundPresets.forEach(preset => {
    preset.addEventListener('click', () => {
        updateBackgroundColor(preset.dataset.color);
    });
});

borderColorInput.addEventListener('input', (e) => {
    updateBorderColor(e.target.value);
});

borderPresets.forEach(preset => {
    preset.addEventListener('click', () => {
        updateBorderColor(preset.dataset.color);
    });
});

// Initialize on load
window.addEventListener('load', () => {
    initCamera();
});

// Cleanup on unload
window.addEventListener('beforeunload', () => {
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
    }
});

