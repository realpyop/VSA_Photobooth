// Frames page functionality
let selectedPhotoIndices = [];
let photos = [];
let selectedFrameId = null;
const maxSelection = 4;

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    initializeFramesPage();
});

function initializeFramesPage() {
    const photosData = sessionStorage.getItem('photosData');
    if (photosData) {
        photos = JSON.parse(photosData);
        displayPhotosForSelection();
    }

    // Check if we have a previously selected frame
    const selectedFrame = sessionStorage.getItem('selectedFrame');
    if (selectedFrame) {
        // Auto-navigate if returning to this page
        const mapping = getFrameMetadata();
        let selectedTheme = null;
        for (const t of Object.keys(mapping)) {
            if (mapping[t].some(f => f.id === selectedFrame)) selectedTheme = t;
        }

        if (selectedTheme) {
            selectTheme(selectedTheme, true);
            setTimeout(() => {
                const card = document.querySelector(`.frame-card[data-frame-id="${selectedFrame}"]`);
                if (card) {
                    card.classList.add('selected');
                    selectedFrameId = selectedFrame;
                    const btn = document.getElementById('useFrameBtn');
                    if (btn) btn.disabled = false;
                }
            }, 50);
        }
    }
}

function displayPhotosForSelection() {
    const photosDisplay = document.getElementById('photosDisplay');
    if (!photosDisplay) return;
    
    photosDisplay.innerHTML = '';

    photos.forEach((photoData, index) => {
        const photoContainer = document.createElement('div');
        photoContainer.className = 'photo-container';
        photoContainer.onclick = () => togglePhotoSelection(index);
        
        const img = document.createElement('img');
        img.src = photoData;
        img.alt = `Photo ${index + 1}`;
        
        const photoNumber = document.createElement('div');
        photoNumber.className = 'photo-number';
        photoNumber.textContent = index + 1;
        
        photoContainer.appendChild(img);
        photoContainer.appendChild(photoNumber);
        photosDisplay.appendChild(photoContainer);
    });
}

function togglePhotoSelection(index) {
    const containers = document.querySelectorAll('.photo-container');
    const container = containers[index];
    
    if (selectedPhotoIndices.includes(index)) {
        selectedPhotoIndices = selectedPhotoIndices.filter(i => i !== index);
        container.classList.remove('selected');
    } else {
        if (selectedPhotoIndices.length < maxSelection) {
            selectedPhotoIndices.push(index);
            container.classList.add('selected');
        } else {
            alert(`You can only select ${maxSelection} photos.`);
            return;
        }
    }
    
    updateSelectionCount();
}

function updateSelectionCount() {
    const countElement = document.getElementById('selectedCount');
    const continueBtn = document.getElementById('continueBtn');
    
    if (countElement) {
        countElement.textContent = selectedPhotoIndices.length;
    }
    if (continueBtn) {
        continueBtn.disabled = selectedPhotoIndices.length !== maxSelection;
    }
}

function proceedToFrames() {
    if (selectedPhotoIndices.length !== maxSelection) {
        alert(`Please select exactly ${maxSelection} photos.`);
        return;
    }
    
    const photoSelection = document.getElementById('photoSelection');
    const themeSelection = document.getElementById('themeSelection');
    
    if (photoSelection && themeSelection) {
        photoSelection.style.display = 'none';
        themeSelection.style.display = 'block';
    }
}

function selectTheme(theme, skipScroll = false) {
    const data = getFrameMetadata();
    const variants = data[theme] || [];
    const variantGrid = document.getElementById('variantGrid');
    const variantTitle = document.getElementById('variantTitle');
    const themeSection = document.getElementById('themeSelection');
    const variantSection = document.getElementById('variantSelection');

    if (!variantGrid || !variantTitle || !themeSection || !variantSection) return;

    variantTitle.textContent = theme === 'cafe' ? 'Cafe - Pick a Design' : 'Christmas - Pick a Design';
    variantGrid.innerHTML = '';

    variants.forEach(v => {
        const card = document.createElement('div');
        card.className = 'frame-card';
        card.setAttribute('data-frame-id', v.id);
        card.onclick = () => selectFrame(v.id);

        const img = document.createElement('img');
        img.src = v.file;
        img.alt = v.label;
        card.appendChild(img);

        const label = document.createElement('div');
        label.className = 'frame-label';
        label.textContent = v.label;
        card.appendChild(label);

        variantGrid.appendChild(card);
    });

    themeSection.style.display = 'none';
    variantSection.style.display = 'block';
    
    const useBtn = document.getElementById('useFrameBtn');
    if (useBtn) useBtn.disabled = true;

    if (!skipScroll) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

function selectFrame(frameId) {
    document.querySelectorAll('.frame-card').forEach(c => c.classList.remove('selected'));
    
    const selectedCard = document.querySelector(`[data-frame-id="${frameId}"]`);
    if (selectedCard) {
        selectedCard.classList.add('selected');
    }
    
    selectedFrameId = frameId;
    
    const useBtn = document.getElementById('useFrameBtn');
    if (useBtn) useBtn.disabled = false;
}

function backToThemes() {
    const themeSection = document.getElementById('themeSelection');
    const variantSection = document.getElementById('variantSelection');
    
    if (themeSection && variantSection) {
        variantSection.style.display = 'none';
        themeSection.style.display = 'block';
    }
    
    const variantGrid = document.getElementById('variantGrid');
    if (variantGrid) variantGrid.innerHTML = '';
    
    const useBtn = document.getElementById('useFrameBtn');
    if (useBtn) useBtn.disabled = true;
    
    document.querySelectorAll('.frame-card').forEach(c => c.classList.remove('selected'));
}

function confirmFrameSelection() {
    const selectedCard = document.querySelector('.frame-card.selected');
    if (!selectedCard) {
        alert('Select a frame design first.');
        return;
    }

    const frameId = selectedCard.getAttribute('data-frame-id');
    
    // Get frame metadata to determine photo count based on frame size
    const frameData = getFrameMetadata();
    let selectedFrame = null;
    let photoCount = 4; // default
    
    // Find the selected frame and get its photo count
    for (const theme of Object.values(frameData)) {
        for (const frame of theme) {
            if (frame.id === frameId) {
                selectedFrame = frame;
                // "big" frames = 4 photos, "small" frames = 3 photos
                photoCount = frame.size === 'big' ? 4 : 3;
                break;
            }
        }
        if (selectedFrame) break;
    }
    
    // Store both frame ID and required photo count
    sessionStorage.setItem('selectedFrame', frameId);
    sessionStorage.setItem('photoCount', photoCount);
    sessionStorage.setItem('frameLabel', selectedFrame?.label || 'Selected Frame');
    
    console.log(`Selected frame: ${frameId}, Photos needed: ${photoCount}`);
    
    // Navigate to photo taking
    window.location.href = '../phototaker.html';
}

function goBack() {
    window.location.href = '../index.html';
}