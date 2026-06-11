const app = {
    next: () => {
        document.getElementById('step-0').classList.remove('show');
        document.getElementById('step-1').classList.add('show');
    },
    celebrate: () => {
        confetti({ particleCount: 300, spread: 120, origin: { y: 0.6 } });
    }
};
