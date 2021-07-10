const socket = io({
    transports: ['websocket'],
    upgrade: false
});

let passwordInput, errorElem;


let sendPassword = (event) => {
    if (event.keyCode === 13) {
        let value = passwordInput.value;
        socket.emit('setAdmin', (value), (res) => {
            if (res) {
                passwordInput.style.display = 'none';
            }
            userAdmin = res;
        });
    }
}

let displayAdminPassword = () => {
    passwordInput = document.getElementById('password-input');
    passwordInput.style.display = 'block';
}

let goToJoinTournament = () => {
    socket.emit('checkTournamentOpen', (res) => {
        if (res) {
            includeHTML(2);
        }
    });
}

socket.on('error', (message) => {
    errorElem = document.getElementById('error');
    let errorMessage = document.getElementById('error-message');
    errorElem.style.display = 'block';
    errorMessage.innerHTML = message;
    setTimeout(() => {
        errorElem.style.display = 'none';
    }, 10000);
})

includeHTML(1);