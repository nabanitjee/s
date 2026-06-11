function startExperience() {
    document.getElementById('intro-screen').classList.remove('active');
    document.getElementById('chat-screen').classList.add('active');
}

function celebrate() {
    confetti({
        particleCount: 200,
        spread: 100,
        origin: { y: 0.7 },
        colors: ['#ff9a9e', '#fad0c4', '#a1c4fd', '#c2e9fb']
    });
}
