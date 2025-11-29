function startPhotobooth() {
    // Clicking animation 
    const button = document.querySelector('.start-button');
    button.style.transform = 'translateY(2px) scale(0.95)';

    // Navigate to countdown page
        setTimeout(() => {
            button.style.transform = 'translateY(-2px) scale(1.05)';

            setTimeout(() => {
                // Show the frames selection page first
                window.location.href = './pages/frames.html';
            }, 150);
        }, 150);
}


// Countdown
function startCountdown() {
    let count = 5;
    const countdownNumber = document.getElementById('countdownNumber');
    const countdownText = document.getElementById('countdownText');
    const countdownRing = document.getElementById('countdownRing');

    if(!countdownNumber) {
        return;
    }

    // Initialize camera
    initializeCamera();

    // Countdown Ring animation
    const circumference = 2 * Math.PI * 90;
    countdownRing.style.strokeDasharray = circumference;
    countdownRing.style.strokeDashoffset = circumference;

    const countdownInterval = setInterval(() => {
        const progress = (6 - count) / 5;
        countdownRing.style.strokeDashoffset = circumference - (progress * circumference);

        if (count > 0) {
            countdownNumber.textContent = count;
            countdownNumber.style.transform = 'translate(-50%, -50%) scale(1.2)';
            
            setTimeout(() => {
                countdownNumber.style.transform = 'translate(-50%, -50%) scale(1)';
            }, 200);
            
            if (count === 1) {
                countdownText.textContent = 'Say cheese! 📸';
            }
            
            count--;
        } else {
            // Countdown finished - take photo
            clearInterval(countdownInterval);

            countdownRing.style.strokeDashoffset = 0;
            countdownNumber.textContent = '📸';
            countdownNumber.style.transform = 'translate(-50%, -50%) scale(1)';
            countdownText.textContent = 'Perfect!';
            
            // Flash effect
            document.body.style.backgroundColor = 'white';
            setTimeout(() => {
                document.body.style.backgroundColor = '';
                capturePhoto();
            }, 200);
        }
    }, 1000)
}


// Initilize camera preview
function initializeCamera() {
    const video = document.getElementById('cameraVideo');
    if (!video){
        return;
    }

    const constraints = {
        video : {
            facingMode: 'user',
            width: {ideal: 1280, max: 1920},
            height: {ideal: 720, max: 1080}
        }
    };

    navigator.mediaDevices.getUserMedia(constraints)
    .then(stream => {
        video.srcObject = stream;
        video.play();

        window.currentStream = stream;
    })
    .catch(err => {
        console.error('Error accessing camera:', err);
        document.querySelector('.camera-preview').innerHTML =
            '<div class="camera-error">Camera not available<br>Please allow camera to load<div>'
    })
}


// Capture photo
function capturePhoto() {
    const video = document.getElementById('cameraVideo');
    const cameraPreview = document.querySelector('.camere-preview');
}

// Frame selection logic

// Mapping to file locations and labels
function getFrameMetadata() {
    return {
        cafe: [
            { id: 'cafebig1', file: '/assets/frames/cafebig1.svg', label: 'Cafe: Without Cat', size: 'big' },
            { id: 'cafebig2', file: '/assets/frames/cafebig2.svg', label: 'Cafe: With Cat', size: 'big' },
            { id: 'cafesmall1', file: '/assets/frames/cafesmall1.svg', label: 'Cafe: Without Cat Ver. 2', size: 'small' },
            { id: 'cafesmall2', file: '/assets/frames/cafesmall2.svg', label: 'Cafe: With Cat Ver. 2', size: 'small' }
        ],
        christmas: [
            { id: 'christmasbig1', file: '/assets/frames/christmasbig1.svg', label: 'Christmas: Red Ver.', size: 'big' },
            { id: 'christmasbig2', file: '/assets/frames/christmasbig2.svg', label: 'Christmas: Green Ver.', size: 'big' },
            { id: 'christmassmall1', file: '/assets/frames/christmassmall1.svg', label: 'Christmas: Red Ver. 2', size: 'small' },
            { id: 'christmassmall2', file: '/assets/frames/christmassmall2.svg', label: 'Christmas: Green Ver. 2', size: 'small' }
        ]
    };
}

// Show theme's two styles in the UI
function selectTheme(theme, skipScroll = false) {
    const data = getFrameMetadata();
    const variants = data[theme] || [];
        const variantGrid = document.getElementById('variantGrid');
    const variantTitle = document.getElementById('variantTitle');
    const themeSection = document.getElementById('themeSelection');
    const variantSection = document.getElementById('variantSelection');

    if (!variantGrid || !variantTitle || !themeSection || !variantSection) return;

    // Set title and the grid
    variantTitle.textContent = theme === 'cafe' ? 'Cafe - Pick a Design' : 'Christmas - Pick a Design';
    variantGrid.innerHTML = '';

    // Builds two cards
    variants.forEach(v => {
        const card = document.createElement('div');
        card.className = 'frame-card';
        card.setAttribute('data-frame-id', v.id);
        card.onclick = () => selectFrame(v.id);

        const img = document.createElement('img');
            img.src = v.file.replace('../assets', '/assets');
        img.alt = v.label;
        card.appendChild(img);

        const label = document.createElement('div');
        label.className = 'frame-label';
        label.textContent = v.label;
        card.appendChild(label);

        variantGrid.appendChild(card);
    });

    // Show the different selections, hiding the initial theme selection
    themeSection.hidden = true;
    variantSection.hidden = false;
    // Reset any previous selection
    document.querySelectorAll('.frame-card').forEach(c=>c.classList.remove('selected'));
    const useBtn = document.getElementById('useFrameBtn'); if (useBtn) useBtn.disabled = true;

    if (!skipScroll) window.scrollTo({ top: 0, behavior: 'smooth' });
}

function backToThemes() {
    const themeSection = document.getElementById('themeSelection');
    const variantSection = document.getElementById('variantSelection');
    if (!themeSection || !variantSection) return;
    variantSection.hidden = true;
    themeSection.hidden = false;
    // Clear different types grid
    const variantGrid = document.getElementById('variantGrid'); if (variantGrid) variantGrid.innerHTML = '';
    // Rest button and selection
    const useBtn = document.getElementById('useFrameBtn'); if (useBtn) useBtn.disabled = true;
    document.querySelectorAll('.frame-card').forEach(c=>c.classList.remove('selected'));
}

// Called from pages/frames.html on click
function selectFrame(frameId) {
    // Visual selection
    document.querySelectorAll('.frame-card').forEach(c => c.classList.remove('selected'));
    const el = document.querySelector(`.frame-card[data-frame-id="${frameId}"]`);
    if (el) el.classList.add('selected');

    // Enable the use button
    const useBtn = document.getElementById('useFrameBtn');
    if (useBtn) useBtn.disabled = false;
}

function confirmFrameSelection() {
    const sel = document.querySelector('.frame-card.selected');
    if (!sel) {
        alert('Select a frame design first.');
        return;
    }

    const id = sel.getAttribute('data-frame-id');
    // Persist selection for the session (available across the pages)
    sessionStorage.setItem('selectedFrame', id);

    // Continue to countdown / capture flow
    window.location.href = './countdown.html';
}

function goBack() {
    // Return to the start page
    window.location.href = '../index.html';
}

// Called by countdown page on load - if user selected a frame, show an overlay preview
function applySelectedFrameToPreview() {
    const sel = sessionStorage.getItem('selectedFrame');
    if (!sel) return;

    // Create overlay element inside the camera-preview
    const cameraPreview = document.querySelector('.camera-preview');
    if (!cameraPreview) return;

    // Remove any previous overlay
    const existing = cameraPreview.querySelector('.frame-overlay');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.className = 'frame-overlay';
    // Maps frame id to asset path; the assets live in ../assets/frames/... relative to countdown page
    const mapping = getFrameMetadata();
    const map = {};
    Object.keys(mapping).forEach(k => mapping[k].forEach(f => map[f.id] = f.file));


    const fallback = Object.values(map)[0] || '';
    overlay.style.backgroundImage = fallback ? `url('${map[sel] || fallback}')` : '';
    overlay.style.backgroundSize = 'contain';
    overlay.style.pointerEvents = 'none';
    cameraPreview.appendChild(overlay);
}

// Attempt to apply selected frame when any page with camera preview loads, just for safety
document.addEventListener('DOMContentLoaded', () => {
    applySelectedFrameToPreview();
});