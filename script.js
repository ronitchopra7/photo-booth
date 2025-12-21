// State management
let stream = null;
let photos = [];
let currentPhotoIndex = 0;
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

// Capture photo
function capturePhoto() {
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
        createStrip();
        cameraSection.style.display = 'none';
        stripSection.style.display = 'flex';
    } else {
        // Brief flash effect
        flashEffect();
    }
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
    const stripWidth = 1200;
    const stripHeight = 1800;
    const photoWidth = stripWidth / 4;
    const photoHeight = stripHeight / 4;
    const spacing = 20;

    stripCanvas.width = stripWidth;
    stripCanvas.height = stripHeight;

    const ctx = stripCanvas.getContext('2d');
    
    // White background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, stripWidth, stripHeight);

    // Draw each photo
    photos.forEach((photoData, index) => {
        const img = new Image();
        img.onload = () => {
            const x = index * photoWidth;
            const y = index * photoHeight + (index * spacing);
            
            // Calculate aspect ratio to fit photo
            const imgAspect = img.width / img.height;
            const slotAspect = photoWidth / photoHeight;
            
            let drawWidth = photoWidth;
            let drawHeight = photoHeight;
            let drawX = x;
            let drawY = y;

            if (imgAspect > slotAspect) {
                // Image is wider - fit to height
                drawHeight = photoHeight;
                drawWidth = drawHeight * imgAspect;
                drawX = x + (photoWidth - drawWidth) / 2;
            } else {
                // Image is taller - fit to width
                drawWidth = photoWidth;
                drawHeight = drawWidth / imgAspect;
                drawY = y + (photoHeight - drawHeight) / 2;
            }

            ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
            
            // If this is the last image, trigger download button enable
            if (index === photos.length - 1) {
                downloadBtn.disabled = false;
                shareBtn.disabled = false;
            }
        };
        img.src = photoData;
    });
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
            
            if (navigator.share && navigator.canShare({ files: [file] })) {
                try {
                    await navigator.share({
                        files: [file],
                        title: 'My Photo Strip',
                        text: 'Check out my photo strip!'
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
    video.srcObject = null;

    // Reset UI
    for (let i = 1; i <= totalPhotos; i++) {
        const photoElement = document.getElementById(`photo-${i}`);
        photoElement.src = '';
        photoElement.classList.remove('show');
        photoElement.parentElement.classList.remove('filled');
    }

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

