
let ttUserSearch = [];
let user, platform = 'epic';
let optionList, chevron, inputJoueur, listPlayerSearched, listPlayerRegistered,
    titreListe, modalValidation, progressBar, timer, interval, btnPreparatif, btnCancel, btnNext;

let dropdown = () => {
    optionList = document.getElementById('option-list');
    chevron = document.getElementById('chevron-select');
    if (optionList.style.display === 'none') {
        optionList.style.display = 'block';
        chevron.animate([
            /* {transform: 'rotate(0)'}, */
            { transform: 'rotate(180deg)' }
        ], {
            duration: 300,
            iterations: 1
        })
    } else {
        optionList.style.display = 'none';
    }
}

let searchName = () => {
    inputJoueur = document.getElementById('input-joueur');
    listPlayerSearched = document.getElementById('list-player-searched');
    let strSearched = inputJoueur.value;
    if (strSearched.length > 2) {
        socket.emit('searchPlayer', { platform: platform, strSearched: strSearched }, (response) => {
            ttUserSearch = response.data;
            if (ttUserSearch.length > 0) {
                listPlayerSearched.style.display = 'block';
                let str = '';
                ttUserSearch.forEach(u => {
                    str += `
                    <div class="player-listed" onclick="selectPlayer('`+ u.platformUserIdentifier + `')">
                        <div>
                            `+ u.platformUserHandle + `
                        </div>
                    </div>`;
                });
                listPlayerSearched.innerHTML = str;
            }
        });
    }
    if (ttUserSearch?.length === 0 || strSearched === '') {
        listPlayerSearched.style.display = 'none';
    }
}

let selectPlayer = (userId) => {
    ttUserSearch = null;
    listPlayerSearched.style.display = 'none';
    socket.emit('getPlayer', { platform: platform, userId: userId }, (response) => {
        user = response.data;
        console.log(user)
        if (user) {
            let userExist = ttUserRegistered?.find(u => u.metadata.playerId === user.metadata.playerId);
            if (userExist) {
                inputJoueur.value = '';
            } else {
                inputJoueur.value = user.platformInfo.platformUserHandle;
                inputJoueur.style.backgroundColor = 'rgb(2 175 41 / 68%)';
                inputJoueur.style.color = 'white';
                socket.emit('addPlayer', user, (userUpdated) => {
                    user = userUpdated;
                    setProfile();
                });
            }
        }
    });
}

let resetPlayer = () => {
    inputJoueur.style.backgroundColor = 'white';
    inputJoueur.style.color = 'black';
    inputJoueur.value = '';
    if (user) {
        socket.emit('removePlayer', (user));
    }
}

let getUser = () => {
    socket.emit('getUsers');
}

let askReady = () => {
    if (userAdmin) {
        btnPreparatif = document.getElementById('btn-preparatif');
        btnCancel = document.getElementById('btn-cancel');
        btnPreparatif.style.display = 'none';
        btnCancel.style.display = 'inline-block';
        socket.emit('askReady');
    }
}

let setReady = () => {
    socket.emit('setReady');
    modalValidation.style.display = 'none';
}

let cancelTournament = () => {
    socket.emit('cancelTournament');
}

let displayNext = () => {
    if (userAdmin) {
        btnNext = document.getElementById('btn-next');
        btnNext.style.display = 'inline-block';
        for (let i = 0; i < progressBar?.length || 0; i++) {
            progressBar[i].style.display = 'none';
        }
        modalValidation.style.display = 'none';
    }
}

let next = () => {
    if (userAdmin) {
        ttUserRegistered = ttUserRegistered.filter(u => u.ready);
        socket.emit('lastStep');
    }
}

socket.on('updateUser', (ttUserEmitted) => {
    ttUserRegistered = ttUserEmitted || [];
    if (btnPreparatif && btnCancel && userAdmin) {
        btnPreparatif.style.display = 'inline-block';
        btnCancel.style.display = 'none';
        if (btnNext) {
            btnNext.style.display = 'none';
        }
    }
    if (progressBar) {
        for (let i = 0; i < progressBar.length; i++) {
            progressBar[i].style.display = 'none';
        }
    }
    if (modalValidation) {
        modalValidation.style.display = 'none';
    }
    if (interval) clearInterval(interval);
    displayUser();
});

displayUser = () => {
    titreListe = document.getElementById('titre-liste');
    if (titreListe) {
        titreListe.innerHTML = 'Liste des participants inscrits (' + ttUserRegistered.length + ') :';
        listPlayerRegistered = document.getElementById('list-player-registered');
        let str = '';
        ttUserRegistered.forEach(u => {
            let rank = u.segments.find(s => s.attributes.playlistId === 11); //correspond à rank 2v2
            str += `
            <div class="col-md-6">
                <div id="`+ u?.metadata?.playerId + `" class="player-registered` + (u?.metadata?.playerId === user?.metadata?.playerId ? ' user-client' : '') + `">
                    <div class="d-flex align-items-center">    
                        <img class="img-rank" src="`+ (rank?.stats?.tier?.metadata?.iconUrl || '/assets/logos/user_unknown.jpg') + `" alt="">
                        <span>`+ u?.platformInfo?.platformUserHandle + `</span>
                    </div>
                    <div class="ready-element">
                        <i class="check-element fa fa-check-circle" aria-hidden="true"></i>
                        <i class="question-element fa fa-question-circle" aria-hidden="true"></i>
                        <span class="question-element">En attente</span>
                        <span class="check-element">Prêt·e</span>
                    </div>`+ ((userAdmin && u?.clientId !== user?.clientId) ? `
                    <button style="background-color: transparent;" class="admin-elements icon-btn" onclick="removeUser('`+ u?.clientId + `')">
                        <i class="fa fa-times"></i>
                    </button>` : '') + `
                </div>
            </div>`;
        });
        listPlayerRegistered.innerHTML = str;
        console.log(userAdmin)
        checkAdminElement();
    }
}

let removeUser = (userId) => {
    socket.emit('removeUser', userId)
}

socket.on('ruReady', () => {
    modalValidation = document.getElementById('modal-validation');
    let readyElement = document.getElementsByClassName('ready-element');
    timer = document.getElementsByClassName('timer');
    progressBar = document.getElementsByClassName('progress-bar-container');
    modalValidation.style.display = 'block';
    let time = 180;
    for (let i = 0; i < timer.length; i++) {
        timer[i].innerHTML = time + 's';
    }
    let progressBarToAnimate = [];
    for (let i = 0; i < progressBar.length; i++) {
        progressBar[i].style.display = 'block';
        for (let j = 0; j < progressBar[i].children.length; j++) {
            if (progressBar[i].children[j].classList.contains('progress-bar')) {
                progressBarToAnimate.push(progressBar[i].children[j]);
            }
        }
    }
    interval = setInterval(() => {
        if (time === 0) {
            clearInterval(interval);
            displayNext();
        }
        for (let i = 0; i < timer.length; i++) {
            timer[i].innerHTML = time + 's';
        }
        for (let i = 0; i < progressBarToAnimate.length; i++) {
            progressBarToAnimate[i].style.width = (time * 100 / 180) + '%'; //on récupere le pourcentage auquel correspond le timer
        }
        time--;
    }, 1000);
    for (let i = 0; i < readyElement.length; i++) {
        readyElement[i].style.display = 'block';
        let children = readyElement[i].children;
        for (let j = 0; j < children.length; j++) {
            if (children[j].classList.contains('question-element')) {
                children[j].style.display = 'inline';
            } else {
                children[j].style.display = 'none';
            }
        }
    }
});

socket.on('updateUserReady', (ttUser) => {
    ttUserRegistered = ttUser || [];
    displayUser();
    ttUserRegistered.filter(u => u.ready).forEach(u => {
        let playerDisplayed = document.getElementById(u.metadata.playerId);
        if (playerDisplayed) {
            playerDisplayed.style.backgroundColor = 'rgb(2 175 41 / 68%)';
            for (let i = 0; i < playerDisplayed.children.length; i++) {
                if (playerDisplayed.children[i].classList.contains('ready-element')) {
                    let elem = playerDisplayed.children[i];
                    elem.style.display = 'block'
                    let children = elem.children;
                    for (let j = 0; j < children.length; j++) {
                        if (children[j].classList.contains('check-element')) {
                            children[j].style.display = 'inline';
                        } else {
                            children[j].style.display = 'none';
                        }
                    }
                }
            }
        }
    });
    if (ttUserRegistered.length > 0 && !ttUserRegistered.find(u => !u.ready)) {
        clearInterval(interval);
        if (progressBar) {
            for (let i = 0; i < progressBar.length; i++) {
                progressBar[i].style.display = 'none';
            }
        }
        displayNext();
    }
});

socket.on('lastStep', () => {
    includeHTML(3);
});
