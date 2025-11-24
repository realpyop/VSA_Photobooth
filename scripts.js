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
// Countdown
function startCountdown() {
    let count = 5;  // Keep as 5
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
        // Fix progress calculation for 5-second countdown
        const progress = (6 - count) / 5;  // Back to (6 - count) / 5
        countdownRing.style.strokeDashoffset = circumference - (progress * circumference);

        if (count > 0) {
            countdownNumber.textContent = count;
            // Keep the number centered during scale animation
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


// Initilizze camera preview
function initializeCamera() {

}


// Capture photo
function capturePhoto() {

}
