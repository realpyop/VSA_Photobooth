function startPhotobooth() {
    // Clicking animation 
    const button = document.querySelector('.start-button');
    button.style.transform = 'translateY(2px) scale(0.95)';

    // Navigate to countdown page
    setTimeout(() => {
        button.style.transform = 'translateY(-2px) scale(1.05)';

        setTimeout(() => {
            window.location.href = './pages/countdown.html';
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
            '<div class="camera-error">Camera not available<br>Please alllow camera to load<div>'
    })
}


// Capture photo
function capturePhoto() {

}
