var stream = null;
var photos = [];
var totalPhotos = 4;
var currentPhotoIndex = 0;
var isCapturing = false;
var selectedLayout = 'cafe';

var layouts = [
    { id: 'cafe', name: 'Cafe Style', description: 'Checkered background' },
    { id: 'scrapbook', name: 'Scrapbook', description: 'With decorations' },
    { id: 'simple', name: 'Simple Grid', description: 'Clean layout' }
];

var frames = [
    { id: 'none', name: 'No Frame', frameClass: 'frame-none' },
    { id: 'classic', name: 'Classic', frameClass: 'frame-classic' },
    { id: 'gold', name: 'Gold', frameClass: 'frame-gold' },
    { id: 'silver', name: 'Silver', frameClass: 'frame-silver' },
    { id: 'pink', name: 'Pink', frameClass: 'frame-pink' },
    { id: 'blue', name: 'Blue', frameClass: 'frame-blue' },
    { id: 'rainbow', name: 'Rainbow', frameClass: 'frame-rainbow' }
];

function initLayouts() {
    var layoutOptions = document.getElementById('layoutOptions');
    layoutOptions.innerHTML = '';
    
    for (var i = 0; i < layouts.length; i++) {
        var layout = layouts[i];
        var option = document.createElement('div');
        option.className = 'layout-option';
        if (layout.id === 'cafe') {
            option.classList.add('active');
        }
        option.setAttribute('data-layout-id', layout.id);
        option.onclick = function() {
            selectLayout(this.getAttribute('data-layout-id'));
        };
        
        var preview = document.createElement('div');
        preview.className = 'layout-preview';
        if (totalPhotos === 4) {
            preview.classList.add('grid-2x2');
        } else if (totalPhotos === 6) {
            preview.classList.add('grid-2x3');
        } else {
            preview.classList.add('grid-2x4');
        }
        
        for (var j = 0; j < totalPhotos; j++) {
            var box = document.createElement('div');
            box.className = 'layout-preview-box';
            preview.appendChild(box);
        }
        
        var name = document.createElement('div');
        name.className = 'layout-name';
        name.textContent = layout.name;
        
        option.appendChild(preview);
        option.appendChild(name);
        layoutOptions.appendChild(option);
    }
}

function selectLayout(layoutId) {
    selectedLayout = layoutId;
    
    var allOptions = document.querySelectorAll('.layout-option');
    for (var i = 0; i < allOptions.length; i++) {
        allOptions[i].classList.remove('active');
        if (allOptions[i].getAttribute('data-layout-id') === layoutId) {
            allOptions[i].classList.add('active');
        }
    }
}

function initFrames() {
    var frameOptions = document.getElementById('frameOptions');
    frameOptions.innerHTML = '';
    
    for (var i = 0; i < frames.length; i++) {
        var frame = frames[i];
        var btn = document.createElement('button');
        btn.className = 'frame-btn';
        btn.textContent = frame.name;
        btn.setAttribute('data-frame-id', frame.id);
        btn.onclick = function() {
            selectFrame(this.getAttribute('data-frame-id'));
        };
        if (frame.id === 'none') {
            btn.classList.add('active');
        }
        frameOptions.appendChild(btn);
    }
}

function startSession() {
    totalPhotos = parseInt(document.getElementById('photoCount').value);
    photos = [];
    currentPhotoIndex = 0;
    
    document.getElementById('setupSection').style.display = 'none';
    document.getElementById('progressInfo').style.display = 'block';
    document.getElementById('totalCount').textContent = totalPhotos;
    
    startCamera();
}

function startCamera() {
    navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user', width: 640, height: 480 } 
    })
    .then(function(mediaStream) {
        stream = mediaStream;
        var video = document.getElementById('video');
        video.srcObject = mediaStream;
        video.style.display = 'block';
        
        document.getElementById('placeholder').style.display = 'none';
        document.getElementById('startBtn').disabled = true;
        
        setTimeout(function() {
            startCountdown();
        }, 1000);
    })
    .catch(function(err) {
        alert('Camera access denied. Please allow camera permissions.');
    });
}

function startCountdown() {
    if (isCapturing) return;
    isCapturing = true;
    
    var countdownEl = document.getElementById('countdown');
    var count = 3;
    
    countdownEl.style.display = 'block';
    countdownEl.textContent = count;
    
    var countdownInterval = setInterval(function() {
        count--;
        if (count > 0) {
            countdownEl.textContent = count;
        } else {
            clearInterval(countdownInterval);
            countdownEl.textContent = '';
            
            setTimeout(function() {
                countdownEl.style.display = 'none';
                capturePhoto();
            }, 500);
        }
    }, 1000);
}

function capturePhoto() {
    var video = document.getElementById('video');
    var canvas = document.getElementById('photoCanvas');
    
    // Create flash effect
    var flashOverlay = document.createElement('div');
    flashOverlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background-color: white;
        z-index: 9999;
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.1s ease-in-out;
    `;
    document.body.appendChild(flashOverlay);
    
    // Trigger flash
    setTimeout(function() {
        flashOverlay.style.opacity = '1';
    }, 10);
    
    // Remove flash after brief moment
    setTimeout(function() {
        flashOverlay.style.opacity = '0';
        setTimeout(function() {
            document.body.removeChild(flashOverlay);
        }, 100);
    }, 150);
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    var ctx = canvas.getContext('2d');
    
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0);
    
    var photoData = canvas.toDataURL('image/png');
    photos.push(photoData);
    
    currentPhotoIndex++;
    document.getElementById('currentCount').textContent = currentPhotoIndex;
    
    isCapturing = false;
    
    if (currentPhotoIndex < totalPhotos) {
        setTimeout(function() {
            startCountdown();
        }, 2000);
    } else {
        finishSession();
    }
}

function finishSession() {
    stopCamera();
    
    // document.getElementById('video').style.display = 'none';
    // document.getElementById('progressInfo').style.display = 'none';
    // document.getElementById('cameraSection').style.display = 'none';
    
    // displayPhotos();
    
    // document.getElementById('startBtn').style.display = 'none';
    // document.getElementById('retakeBtn').style.display = 'flex';
    // document.getElementById('downloadBtn').style.display = 'flex';
    // document.getElementById('framesSection').style.display = 'block';
    
    // initLayouts();
    // initFrames();

    // Store photos in sessionStorage then navigate to frames selection page
    sessionStorage.setItem('photosData', JSON.stringify(photos));
    sessionStorage.setItem('totalPhotos', photos.length.toString());

    window.location.href = './pages/frames.html';
}

function displayPhotos() {
    var photoGrid = document.getElementById('photoGrid');
    photoGrid.innerHTML = '';
    photoGrid.classList.add('active');
    
    for (var i = 0; i < photos.length; i++) {
        var photoItem = document.createElement('div');
        photoItem.className = 'photo-item';
        
        var photoWithFrame = document.createElement('div');
        photoWithFrame.className = 'photo-with-frame';
        
        var img = document.createElement('img');
        img.src = photos[i];
        img.alt = 'Photo ' + (i + 1);
        
        var frameOverlay = document.createElement('div');
        frameOverlay.className = 'frame-overlay';
        
        photoWithFrame.appendChild(img);
        photoWithFrame.appendChild(frameOverlay);
        photoItem.appendChild(photoWithFrame);
        photoGrid.appendChild(photoItem);
    }
}

function stopCamera() {
    if (stream) {
        var tracks = stream.getTracks();
        for (var i = 0; i < tracks.length; i++) {
            tracks[i].stop();
        }
        stream = null;
    }
}

function retakeSession() {
    photos = [];
    currentPhotoIndex = 0;
    isCapturing = false;
    
    document.getElementById('photoGrid').classList.remove('active');
    document.getElementById('photoGrid').innerHTML = '';
    document.getElementById('cameraSection').style.display = 'flex';
    document.getElementById('setupSection').style.display = 'block';
    document.getElementById('placeholder').style.display = 'block';
    
    document.getElementById('startBtn').style.display = 'flex';
    document.getElementById('startBtn').disabled = false;
    document.getElementById('retakeBtn').style.display = 'none';
    document.getElementById('downloadBtn').style.display = 'none';
    document.getElementById('framesSection').style.display = 'none';
}

function selectFrame(frameId) {
    var selectedFrame = null;
    
    for (var i = 0; i < frames.length; i++) {
        if (frames[i].id === frameId) {
            selectedFrame = frames[i];
            break;
        }
    }
    
    if (selectedFrame) {
        var frameOverlays = document.querySelectorAll('.frame-overlay');
        for (var i = 0; i < frameOverlays.length; i++) {
            frameOverlays[i].className = 'frame-overlay ' + selectedFrame.frameClass;
        }
    }
    
    var allButtons = document.querySelectorAll('.frame-btn');
    for (var i = 0; i < allButtons.length; i++) {
        allButtons[i].classList.remove('active');
        if (allButtons[i].getAttribute('data-frame-id') === frameId) {
            allButtons[i].classList.add('active');
        }
    }
}

function downloadAllPhotos() {
    var frameOverlays = document.querySelectorAll('.frame-overlay');
    var frameClass = null;
    
    if (frameOverlays.length > 0) {
        var classList = frameOverlays[0].className.split(' ');
        for (var i = 0; i < classList.length; i++) {
            if (classList[i].indexOf('frame-') === 0 && classList[i] !== 'frame-overlay') {
                frameClass = classList[i];
                break;
            }
        }
    }
    
    var loadedImages = [];
    var imagesLoaded = 0;
    
    for (var i = 0; i < photos.length; i++) {
        var img = new Image();
        (function(index) {
            img.onload = function() {
                loadedImages[index] = this;
                imagesLoaded++;
                
                if (imagesLoaded === photos.length) {
                    createCollage(loadedImages, frameClass);
                }
            };
            img.src = photos[index];
        })(i);
    }
}

function createCollage(images, frameClass) {
    var photoCount = images.length;
    var cols = 2;
    var rows = Math.ceil(photoCount / 2);
    
    var borderSize = frameClass && frameClass !== 'frame-none' ? 20 : 0;
    var photoWidth = images[0].width;
    var photoHeight = images[0].height;
    var spacing = 15;
    var padding = 40;
    
    var collageWidth = (photoWidth * cols) + (spacing * (cols - 1)) + (padding * 2);
    var collageHeight = (photoHeight * rows) + (spacing * (rows - 1)) + (padding * 2);
    
    var collageCanvas = document.createElement('canvas');
    collageCanvas.width = collageWidth;
    collageCanvas.height = collageHeight;
    var collageCtx = collageCanvas.getContext('2d');
    
    if (selectedLayout === 'cafe') {
        var gridSize = 30;
        collageCtx.fillStyle = '#8B7D6B';
        collageCtx.fillRect(0, 0, collageWidth, collageHeight);
        
        collageCtx.strokeStyle = '#6B5E4F';
        collageCtx.lineWidth = 2;
        for (var x = 0; x <= collageWidth; x += gridSize) {
            collageCtx.beginPath();
            collageCtx.moveTo(x, 0);
            collageCtx.lineTo(x, collageHeight);
            collageCtx.stroke();
        }
        for (var y = 0; y <= collageHeight; y += gridSize) {
            collageCtx.beginPath();
            collageCtx.moveTo(0, y);
            collageCtx.lineTo(collageWidth, y);
            collageCtx.stroke();
        }
    } else if (selectedLayout === 'scrapbook') {
        collageCtx.fillStyle = '#F5E6D3';
        collageCtx.fillRect(0, 0, collageWidth, collageHeight);
    } else {
        collageCtx.fillStyle = '#FFFFFF';
        collageCtx.fillRect(0, 0, collageWidth, collageHeight);
    }
    
    for (var i = 0; i < images.length; i++) {
        var row = Math.floor(i / cols);
        var col = i % cols;
        
        var x = padding + (col * (photoWidth + spacing));
        var y = padding + (row * (photoHeight + spacing));
        
        if (frameClass && frameClass !== 'frame-none') {
            collageCtx.save();
            collageCtx.translate(x, y);
            
            if (frameClass === 'frame-classic') {
                collageCtx.fillStyle = '#000';
            } else if (frameClass === 'frame-gold') {
                collageCtx.fillStyle = '#FFD700';
            } else if (frameClass === 'frame-silver') {
                collageCtx.fillStyle = '#C0C0C0';
            } else if (frameClass === 'frame-pink') {
                collageCtx.fillStyle = '#FF69B4';
            } else if (frameClass === 'frame-blue') {
                collageCtx.fillStyle = '#4169E1';
            } else if (frameClass === 'frame-rainbow') {
                var gradient = collageCtx.createLinearGradient(0, 0, photoWidth + borderSize * 2, photoHeight + borderSize * 2);
                gradient.addColorStop(0, 'red');
                gradient.addColorStop(0.17, 'orange');
                gradient.addColorStop(0.33, 'yellow');
                gradient.addColorStop(0.5, 'green');
                gradient.addColorStop(0.67, 'blue');
                gradient.addColorStop(0.83, 'indigo');
                gradient.addColorStop(1, 'violet');
                collageCtx.fillStyle = gradient;
            }
            
            collageCtx.fillRect(-borderSize, -borderSize, photoWidth + borderSize * 2, photoHeight + borderSize * 2);
            collageCtx.drawImage(images[i], 0, 0);
            collageCtx.restore();
        } else {
            collageCtx.fillStyle = '#FFFFFF';
            collageCtx.fillRect(x - 5, y - 5, photoWidth + 10, photoHeight + 10);
            collageCtx.drawImage(images[i], x, y);
        }
    }
    
    var link = document.createElement('a');
    link.download = 'photo-booth-collage-' + Date.now() + '.png';
    link.href = collageCanvas.toDataURL();
    link.click();
}

window.addEventListener('beforeunload', function() {
    stopCamera();
});