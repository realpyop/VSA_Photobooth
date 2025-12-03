// preview.js - Photo preview and email functionality

let photos = [];
let selectedFrameId = null;
let frameMetadata = null;

document.addEventListener('DOMContentLoaded', () => {
    initializePreviewPage();
});

function initializePreviewPage() {
    console.log("Starting preview page initialization...");

    // Load photos from sessionStorage
    const photosData = sessionStorage.getItem('photosData');
    if (!photosData) {
        alert("No photos found. Please take photos first.");
        window.location.href = "../index.html";
        return;
    }

    photos = JSON.parse(photosData);
    console.log("Loaded photos: ", photos.length);

    // Get selected frame
    selectedFrameId = sessionStorage.getItem('selectedFrame');
    if (!selectedFrameId) {
        alert("No frame selected. Please select a frame first.");
        window.location.href = './frames.html';
        return;
    }

    console.log("Selected frame: ", selectedFrameId);
    frameMetadata = getFrameMetadata();

    // Display photos with frames
    displayPhotosWithFrames();
    
    // Setup email form
    setupDownloadForm();
}

async function displayPhotosWithFrames() {
    const grid = document.getElementById('photoPreviewGrid');
    if (!grid) return;
    
    // Clear any existing content
    grid.innerHTML = '';
    
    // Show loading message while we work
    grid.innerHTML = '<div class="loading-message">Loading preview...</div>';
    
    try {
        // Get the path to the SVG frame file
        const framePath = getFrameFilePath(selectedFrameId);
        console.log('Frame path:', framePath);
        
        // Load the SVG frame content
        const frameContent = await loadSVGFrame(framePath);
        console.log('Frame loaded successfully');
        
        // Clear loading message
        grid.innerHTML = '';
        
        // Create ONE composite frame with ALL photos
        await createCompositeFrameWithAllPhotos(photos, frameContent, grid);
        
    } catch (error) {
        console.error('Error loading frame:', error);
        grid.innerHTML = '<div class="error-message">Error loading frame preview. Using basic layout...</div>';
        
        // Fallback: show photos without frames after a delay
        setTimeout(() => {
            grid.innerHTML = '';
            for (let i = 0; i < photos.length; i++) {
                createPhotoPreviewItem(photos[i], null, i, grid);
            }
        }, 1500);
    }
}

async function createCompositeFrameWithAllPhotos(allPhotos, frameContent, container) {
    return new Promise(async (resolve) => {
        try {
            // Create the main container for the composite
            const previewItem = document.createElement('div');
            previewItem.className = 'composite-frame-container';
            previewItem.style.maxWidth = '600px';
            previewItem.style.margin = '0 auto';
            
            // Create canvas for the composite
            const canvas = document.createElement('canvas');
            canvas.className = 'composite-frame';
            canvas.width = 800;  // Larger canvas for the composite
            canvas.height = 800;
            canvas.style.width = '100%';
            canvas.style.height = 'auto';
            canvas.style.borderRadius = '15px';
            
            const ctx = canvas.getContext('2d');
            
            // Load all photos
            const photoImages = await Promise.all(
                allPhotos.map(photoUrl => loadImage(photoUrl))
            );
            
            if (frameContent && photoImages.length > 0) {
                // Create composite with frame
                await createFrameWithMultiplePhotos(ctx, photoImages, frameContent, canvas.width, canvas.height);
            } else {
                // Fallback: create simple grid
                await createSimplePhotoGrid(ctx, photoImages, canvas.width, canvas.height);
            }
            
            // Add the canvas to container
            previewItem.appendChild(canvas);
            container.appendChild(previewItem);
            
            resolve();
            
        } catch (error) {
            console.error('Error creating composite frame:', error);
            resolve();
        }
    });
}

// Get photo slot configuration for specific frame
function getPhotoSlotConfiguration(frameId) {
    switch(frameId) {
        case 'cafebig1':
            return [
                { x: 0.18, y: 0.05, width: 0.33, height: 0.4 },   // Top-left
                { x: 0.49, y: 0.05, width: 0.33, height: 0.4 },    // Top-right  
                { x: 0.18, y: 0.47, width: 0.33, height: 0.4 },   // Bottom-left
                { x: 0.49, y: 0.47, width: 0.33, height: 0.4 }     // Bottom-right
            ];
            
        case 'cafebig2':
            return [
                { x: 0.18, y: 0.15, width: 0.29, height: 0.38 },    // Top-left - adjusted for cat decoration
                { x: 0.46, y: 0.15, width: 0.29, height: 0.38 },    // Top-right
                { x: 0.18, y: 0.52, width: 0.29, height: 0.38 },    // Bottom-left
                { x: 0.46, y: 0.52, width: 0.29, height: 0.38 }     // Bottom-right
            ];
            
        case 'cafesmall1':
            return [
                { x: 0.19, y: 0.01, width: 0.27, height: 0.32 },    // 1
                { x: 0.19, y: 0.33, width: 0.27, height: 0.32 },    // 2
                { x: 0.19, y: 0.67, width: 0.27, height: 0.27 },    // 3
            ];
            
        case 'cafesmall2':
            return [
                { x: 0.19, y: 0.06, width: 0.255, height: 0.29 },    // 1
                { x: 0.19, y: 0.37, width: 0.255, height: 0.29 },    // 2
                { x: 0.19, y: 0.67, width: 0.27, height: 0.27 },    // 3
            ];
            
        case 'christmasbig1':
            return [
                { x: 0.18, y: 0.14, width: 0.32, height: 0.38 },    // Top-left
                { x: 0.50, y: 0.14, width: 0.32, height: 0.38 },    // Top-right
                { x: 0.18, y: 0.52, width: 0.32, height: 0.38 },    // Bottom-left
                { x: 0.50, y: 0.52, width: 0.32, height: 0.38 }     // Bottom-right
            ];
            
        case 'christmasbig2':
            return [
                { x: 0.18, y: 0.14, width: 0.32, height: 0.38 },    // Top-left
                { x: 0.50, y: 0.14, width: 0.32, height: 0.38 },    // Top-right
                { x: 0.18, y: 0.52, width: 0.32, height: 0.38 },    // Bottom-left
                { x: 0.50, y: 0.52, width: 0.32, height: 0.38 }     // Bottom-right
            ];
            
        case 'christmassmall1':
            return [
                { x: 0.21, y: 0.11, width: 0.235, height: 0.28 },    // 1
                { x: 0.21, y: 0.40, width: 0.235, height: 0.28 },    // 2
                { x: 0.21, y: 0.7, width: 0.235, height: 0.25 },    // 3
            ];
            
        case 'christmassmall2':
            return [
                { x: 0.21, y: 0.11, width: 0.235, height: 0.28 },    // 1
                { x: 0.21, y: 0.40, width: 0.235, height: 0.28 },    // 2
                { x: 0.21, y: 0.7, width: 0.235, height: 0.25 },    // 3
            ];
            
        default:
            // Fallback configuration
            return [
                { x: 0.125, y: 0.17, width: 0.30, height: 0.35 },   // Top-left
                { x: 0.51, y: 0.17, width: 0.30, height: 0.35 },    // Top-right  
                { x: 0.125, y: 0.54, width: 0.30, height: 0.35 },   // Bottom-left
                { x: 0.51, y: 0.54, width: 0.30, height: 0.35 }     // Bottom-right
            ];
    }
}

// Updated frame composition function
async function createFrameWithMultiplePhotos(ctx, photoImages, frameContent, canvasWidth, canvasHeight) {
    try {
        // Get photo slot configuration based on selected frame
        const photoSlots = getPhotoSlotConfiguration(selectedFrameId);
        
        console.log(`Using photo slots for frame: ${selectedFrameId}`, photoSlots);
        
        photoImages.forEach((photo, index) => {
            if (index < photoSlots.length) {
                const slot = photoSlots[index];
                const slotX = slot.x * canvasWidth;
                const slotY = slot.y * canvasHeight;
                const slotWidth = slot.width * canvasWidth;
                const slotHeight = slot.height * canvasHeight;
                
                // Fit square photo to HEIGHT of portrait slot
                const photoSize = slotHeight;
                const drawX = slotX + (slotWidth - photoSize) / 2;
                const drawY = slotY;
                
                // Draw photo maintaining square aspect
                ctx.save();
                ctx.beginPath();
                ctx.rect(slotX, slotY, slotWidth, slotHeight);
                ctx.clip();
                ctx.drawImage(photo, drawX, drawY, photoSize, photoSize);
                ctx.restore();
            }
        });
        
        // Draw frame on top
        const frameImg = await createImageFromSVG(frameContent, canvasWidth, canvasHeight);
        ctx.drawImage(frameImg, 0, 0, canvasWidth, canvasHeight);
        
    } catch (error) {
        console.error('Error in frame composition:', error);
        await createSimplePhotoGrid(ctx, photoImages, canvasWidth, canvasHeight);
    }
}



// Helper function to find the frame file path
function getFrameFilePath(frameId) {
    // Look through all themes to find our frame
    for (const theme of Object.values(frameMetadata)) {
        for (const frame of theme) {
            if (frame.id === frameId) {
                return frame.file;
            }
        }
    }
    return null;
}

// Load SVG frame from file
async function loadSVGFrame(framePath) {
    if (!framePath) throw new Error('Frame path not found');
    
    try {
        // Since we're in /pages/ and assets are in /assets/, we need to go up one level
        // Convert /assets/frames/cafebig1.svg to ../assets/frames/cafebig1.svg
        let fullPath = framePath;
        if (framePath.startsWith('/assets/')) {
            fullPath = '..' + framePath;
        } else if (!framePath.startsWith('../')) {
            fullPath = '../' + framePath;
        }
        
        console.log('Loading SVG from:', fullPath);
        
        const response = await fetch(fullPath);
        if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        return await response.text();
    } catch (error) {
        console.error('Error loading SVG:', error);
        throw error;
    }
}

// Create each photo preview item with proper Canvas compositing
async function createPhotoPreviewItem(photoDataUrl, frameContent, index, container) {
    return new Promise(async (resolve) => {
        try {
            // Create the main container
            const previewItem = document.createElement('div');
            previewItem.className = 'photo-preview-item';
            
            // Create photo container
            const frameContainer = document.createElement('div');
            frameContainer.className = 'photo-with-frame-container';
            
            // Create canvas for compositing
            const canvas = document.createElement('canvas');
            canvas.className = 'preview-photo';
            canvas.width = 400;  // Standard size for preview
            canvas.height = 400;
            
            const ctx = canvas.getContext('2d');
            
            // Create photo number badge
            const photoNumber = document.createElement('div');
            photoNumber.className = 'photo-number';
            photoNumber.textContent = `${index + 1}`;
            
            // Load the user photo
            const photoImg = await loadImage(photoDataUrl);
            
            if (frameContent) {
                // Composite photo with frame
                await compositePhotoWithFrame(ctx, photoImg, frameContent, canvas.width, canvas.height);
            } else {
                // Fallback: just draw the photo
                ctx.drawImage(photoImg, 0, 0, canvas.width, canvas.height);
            }
            
            // Assemble the preview item
            frameContainer.appendChild(canvas);
            frameContainer.appendChild(photoNumber);
            previewItem.appendChild(frameContainer);
            
            // Add to the page
            container.appendChild(previewItem);
            
            resolve();
            
        } catch (error) {
            console.error('Error creating photo preview:', error);
            
            // Fallback: create simple image element
            const previewItem = document.createElement('div');
            previewItem.className = 'photo-preview-item';
            
            const img = document.createElement('img');
            img.className = 'preview-photo';
            img.src = photoDataUrl;
            img.style.width = '100%';
            img.style.height = '100%';
            img.style.objectFit = 'cover';
            
            const photoNumber = document.createElement('div');
            photoNumber.className = 'photo-number';
            photoNumber.textContent = `${index + 1}`;
            
            const frameContainer = document.createElement('div');
            frameContainer.className = 'photo-with-frame-container';
            frameContainer.appendChild(img);
            frameContainer.appendChild(photoNumber);
            previewItem.appendChild(frameContainer);
            
            container.appendChild(previewItem);
            resolve();
        }
    });
}

// Composite photo with SVG frame using Canvas
async function compositePhotoWithFrame(ctx, photoImg, frameContent, canvasWidth, canvasHeight) {
    try {
        // Step 1: Draw the photo as background, centered and cropped to fit
        const photoAspect = photoImg.width / photoImg.height;
        const canvasAspect = canvasWidth / canvasHeight;
        
        let drawWidth, drawHeight, drawX, drawY;
        
        if (photoAspect > canvasAspect) {
            // Photo is wider - fit to height
            drawHeight = canvasHeight;
            drawWidth = drawHeight * photoAspect;
            drawX = (canvasWidth - drawWidth) / 2;
            drawY = 0;
        } else {
            // Photo is taller - fit to width
            drawWidth = canvasWidth;
            drawHeight = drawWidth / photoAspect;
            drawX = 0;
            drawY = (canvasHeight - drawHeight) / 2;
        }
        
        ctx.drawImage(photoImg, drawX, drawY, drawWidth, drawHeight);
        
        // Step 2: Create frame image from SVG
        const frameImg = await createImageFromSVG(frameContent, canvasWidth, canvasHeight);
        
        // Step 3: Apply frame as overlay (the frame has transparent areas for photos)
        ctx.drawImage(frameImg, 0, 0, canvasWidth, canvasHeight);
        
    } catch (error) {
        console.error('Error in compositing:', error);
        // Fallback: just draw the photo
        ctx.drawImage(photoImg, 0, 0, canvasWidth, canvasHeight);
    }
}

// Convert SVG content to an Image element
function createImageFromSVG(svgContent, width, height) {
    return new Promise((resolve, reject) => {
        try {
            // Ensure SVG has proper dimensions
            let processedSVG = svgContent;
            
            // Add width and height attributes if missing
            if (!processedSVG.includes('width=') || !processedSVG.includes('height=')) {
                processedSVG = processedSVG.replace(
                    /<svg([^>]*?)>/,
                    `<svg$1 width="${width}" height="${height}">`
                );
            }
            
            // Create blob and object URL
            const svgBlob = new Blob([processedSVG], { type: 'image/svg+xml;charset=utf-8' });
            const url = URL.createObjectURL(svgBlob);
            
            const img = new Image();
            img.onload = () => {
                URL.revokeObjectURL(url); // Clean up
                resolve(img);
            };
            img.onerror = (error) => {
                URL.revokeObjectURL(url); // Clean up
                console.error('Failed to load SVG as image:', error);
                reject(error);
            };
            
            img.src = url;
            
        } catch (error) {
            console.error('Error creating SVG image:', error);
            reject(error);
        }
    });
}

// Utility function to load images
function loadImage(src) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
    });
}

// Email form setup and handling
// function setupEmailForm() {
//     const emailForm = document.getElementById('emailForm');
    
//     if (!emailForm) return;
    
//     emailForm.addEventListener('submit', async (e) => {
//         e.preventDefault();
        
//         const email = document.getElementById('emailInput').value.trim();
//         if (!email) return;
        
//         // Validate email format
//         const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//         if (!emailRegex.test(email)) {
//             showEmailStatus('Please enter a valid email address.', 'error');
//             return;
//         }
        
//         // Process email submission
//         await submitEmail(email);
//     });
// }

// async function submitEmail(email) {
//     const submitButton = document.querySelector('.send-email-button');
    
//     try {
//         // Show loading state
//         showEmailStatus('Preparing photos for email...', 'loading');
//         submitButton.disabled = true;
//         submitButton.textContent = 'Sending...';
        
//         // Get the composite image
//         const compositeCanvas = document.querySelector('.composite-frame');
//         if (!compositeCanvas) {
//             throw new Error('No composite image found');
//         }
        
//         // Convert canvas to blob for email attachment
//         const imageBlob = await new Promise(resolve => {
//             compositeCanvas.toBlob(resolve, 'image/png', 0.9);
//         });
        
//         // Update status
//         showEmailStatus('Sending photos to your email...', 'loading');
        
//         // Simulate email sending with the image
//         await sendEmailWithImage(email, imageBlob);
        
//         // Show success message
//         showEmailStatus('Photos sent successfully! Check your email.', 'success');
//         submitButton.textContent = 'Sent!';
        
//         // Store email for session
//         sessionStorage.setItem('userEmail', email);
//         sessionStorage.setItem('emailSent', 'true');
        
//         // Disable form after successful submission
//         document.getElementById('emailInput').disabled = true;
        
//         // Add completion actions
//         setTimeout(() => {
//             showCompletionOptions();
//         }, 2000);
        
//     } catch (error) {
//         console.error('Email submission error:', error);
//         showEmailStatus('Failed to send photos. Please try again.', 'error');
//         submitButton.disabled = false;
//         submitButton.textContent = 'Send Photos';
//     }
// }

// async function sendEmailWithImage(email, imageBlob) {
//     // In a real implementation, this would send to your email service
//     // For now, we'll simulate the process
//     return new Promise((resolve, reject) => {
//         setTimeout(() => {
//             console.log(`Photos would be sent to: ${email}`);
//             console.log('Image blob size:', imageBlob.size);
            
//             // Simulate random success/failure for testing
//             if (Math.random() > 0.1) { // 90% success rate
//                 resolve();
//             } else {
//                 reject(new Error('Network error'));
//             }
//         }, 3000); // Longer delay to simulate real email sending
//     });
// }

// function simulateEmailSending(email) {
//     // Simulate API call delay
//     return new Promise((resolve, reject) => {
//         setTimeout(() => {
//             console.log(`Photos would be sent to: ${email}`);
//             resolve();
//         }, 2000);
//     });
// }

// function showEmailStatus(message, type) {
//     const emailStatus = document.getElementById('emailStatus');
//     if (!emailStatus) return;
    
//     emailStatus.textContent = message;
//     emailStatus.className = `email-status ${type}`;
// }

// Navigation functions
function goBackToFrames() {
    window.location.href = './frames.html';
}

function startOver() {
    // Clear all session data and go to start
    sessionStorage.clear();
    window.location.href = '../index.html';
}

// function showCompletionOptions() {
//     const emailSection = document.querySelector('.email-section');
//     if (!emailSection) return;
    
//     // Add completion message and options
//     const completionDiv = document.createElement('div');
//     completionDiv.className = 'completion-options';
//     completionDiv.innerHTML = `
//         <div class="completion-message">
//             <h3>🎉 All Done!</h3>
//             <p>Your photos have been sent to your email. What would you like to do next?</p>
//         </div>
//         <div class="completion-actions">
//             <button class="action-button primary" onclick="startOver()">
//                 Take More Photos
//             </button>
//             <button class="action-button secondary" onclick="goBackToFrames()">
//                 Try Different Frame
//             </button>
//         </div>
//     `;
    
//     emailSection.appendChild(completionDiv);
// }

// function setupEmailForm() {
//     const emailForm = document.getElementById('emailForm');
//     const emailInput = document.getElementById('emailInput');
    
//     if (!emailForm || !emailInput) return;
    
//     // Real-time email validation
//     emailInput.addEventListener('input', (e) => {
//         const email = e.target.value.trim();
//         const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        
//         if (email && !emailRegex.test(email)) {
//             emailInput.setCustomValidity('Please enter a valid email address');
//             emailInput.classList.add('invalid');
//         } else {
//             emailInput.setCustomValidity('');
//             emailInput.classList.remove('invalid');
//         }
//     });
    
//     // Form submission
//     emailForm.addEventListener('submit', async (e) => {
//         e.preventDefault();
        
//         const email = emailInput.value.trim();
//         if (!email) {
//             showEmailStatus('Please enter an email address.', 'error');
//             return;
//         }
        
//         // Final email validation
//         const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//         if (!emailRegex.test(email)) {
//             showEmailStatus('Please enter a valid email address.', 'error');
//             emailInput.focus();
//             return;
//         }
        
//         // Process email submission
//         await submitEmail(email);
//     });
// }

function setupDownloadForm() {
    const downloadForm = document.getElementById('downloadForm');
    const nameInput = document.getElementById('nameInput');
    
    if (!downloadForm) return;
    
    downloadForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const userName = nameInput.value.trim() || 'VSA-Student';
        await downloadCompositeImage(userName);
    });
}

async function downloadCompositeImage(userName) {
    const downloadButton = document.querySelector('.download-button');
    
    try {
        showDownloadStatus('Preparing your photos...', 'loading');
        downloadButton.disabled = true;
        downloadButton.textContent = '📸 Preparing...';
        
        const compositeCanvas = document.querySelector('.composite-frame');
        if (!compositeCanvas) {
            throw new Error('No composite image found');
        }
        
        // Create filename with timestamp
        const timestamp = new Date().toLocaleString('en-US', {
            year: 'numeric',
            month: '2-digit', 
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        }).replace(/[/,:]/g, '-').replace(/\s/g, '_');
        
        const filename = `${userName}_at Boba&Brew.png`;
        
        compositeCanvas.toBlob((blob) => {
            const link = document.createElement('a');
            link.download = filename;
            link.href = URL.createObjectURL(blob);
            
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            URL.revokeObjectURL(link.href);
            
            showDownloadStatus('✅ Photo saved successfully! Ready for AirDrop!', 'success');
            downloadButton.textContent = '✅ Downloaded!';
            
            sessionStorage.setItem('userName', userName);
            sessionStorage.setItem('downloadTime', new Date().toISOString());
            
            setTimeout(() => {
                showCompletionOptions();
            }, 1500);
            
        }, 'image/png', 0.9);
        
    } catch (error) {
        console.error('Download error:', error);
        showDownloadStatus('❌ Failed to save photo. Please try again.', 'error');
        downloadButton.disabled = false;
        downloadButton.textContent = '📸 Download Photos';
    }
}

function showDownloadStatus(message, type) {
    const downloadStatus = document.getElementById('downloadStatus');
    if (!downloadStatus) return;
    
    downloadStatus.textContent = message;
    downloadStatus.className = `download-status ${type}`;
}

function showCompletionOptions() {
    const downloadSection = document.querySelector('.download-section');
    if (!downloadSection) return;
    
    const completionDiv = document.createElement('div');
    completionDiv.className = 'completion-options';
    completionDiv.innerHTML = `
        <div class="completion-message">
            <h3>🎉 Photo Saved!</h3>
            <p>The photo is now in your Downloads folder and ready to AirDrop to the student!</p>
        </div>
        <div class="completion-actions">
            <button class="action-button primary" onclick="startOver()">
                📸 Next Student
            </button>
            <button class="action-button secondary" onclick="goBackToFrames()">
                🖼️ Try Different Frame
            </button>
        </div>
    `;
    
    downloadSection.appendChild(completionDiv);
}