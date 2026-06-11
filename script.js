const startBtn = document.getElementById('start-btn');
const step1 = document.getElementById('step1');
const step2 = document.getElementById('step2');

startBtn.addEventListener('click', () => {
    step1.style.opacity = '0';
    setTimeout(() => {
        step1.classList.add('hidden');
        step2.classList.remove('hidden');
        step2.style.opacity = '1';
    }, 500);
});

// Add confetti library (like canvas-confetti) for the final touch
document.getElementById('final-btn').addEventListener('click', () => {
    alert("Trigger your final animation here!");
});
