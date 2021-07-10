let listPlayerRegisteredLastStep, titreListeLastStep;

let initLastStep = () => {
    titreListeLastStep = document.getElementById('titre-liste-last-step');
    if (titreListeLastStep) {
        titreListeLastStep.innerHTML = 'Liste des participants inscrits (' + ttUserRegistered.length + ') :';
        listPlayerRegisteredLastStep = document.getElementById('list-player-registered-last-step');
        let str = '';
        ttUserRegistered.forEach(u => {
            let rank = u.segments.find(s => s.attributes.playlistId === 11); //correspond à rank 2v2
            str += `
            <div class="col-md-6">
                <div id="`+ u?.metadata?.playerId + `" class="player-registered` + (u?.metadata?.playerId === user?.metadata?.playerId ? ' user-client' : '') + `">
                    <div class="d-flex align-items-center">    
                        <img class="img-rank" src="`+ (rank?.stats?.tier?.metadata?.iconUrl || '/assets/Logos/user_unknown.jpg') + `" alt="">
                        <span>`+ u?.platformInfo?.platformUserHandle + `</span>
                    </div>
                    <div class="ready-element">
                        <i class="check-element fa fa-check-circle" aria-hidden="true"></i>
                        <i class="question-element fa fa-question-circle" aria-hidden="true"></i>
                        <span class="question-element">En attente</span>
                        <span class="check-element">Prêt·e</span>
                    </div>
                </div>
            </div>`;
        });
        listPlayerRegisteredLastStep.innerHTML = str;
    }
}

let generateTeams = (teamSize) => {
    let rankMoyen = 0;
    let ttRank = [];
    ttUserRegistered.forEach(u => {
        let segment = u.segments.find(s => (teamSize === 2 ? s.attributes.playlistId === 11 : s.attributes.playlistId === 13));
        ttRank.push(segment?.stats?.rating?.value || 0);
        u.rankUsed = segment?.stats?.rating?.value || 0;
        rankMoyen += segment?.stats?.rating?.value || 0; //MMR du joueur
    });
    rankMoyen = rankMoyen / ttUserRegistered.length;

    //POUR 2V2
    if (teamSize === 2) {
        ttUserRegistered.sort((a, b) => {
            let segmentA = a.segments.find(s => s?.attributes?.playlistId === 11);
            let segmentB = b.segments.find(s => s?.attributes?.playlistId === 11);
            return (segmentA?.stats?.rating?.value || 0) - (segmentB?.stats?.rating?.value || 0)
        });
        let idCroissant = 0;
        let idDecroissant = ttUserRegistered.length - 1;
        let ttTeam = []

        for (let i = 0; i < ttUserRegistered.length / 2; i++) {
            ttTeam.push({ u1: ttUserRegistered[idCroissant], u2: ttUserRegistered[idDecroissant], mmrMoyen: (ttUserRegistered[idCroissant].rankUsed + ttUserRegistered[idDecroissant].rankUsed) / 2 });
            idCroissant++;
            idDecroissant--;
        }
        socket.emit('createTeams', (ttTeam));
    }
}

socket.on('displayTeams', (ttTeam) => {
    listPlayerRegisteredLastStep = document.getElementById('list-player-registered-last-step');
    let str = '';
    ttTeam.forEach(team => {
        let yourTeam = team?.u1?.metadata?.playerId === user?.metadata?.playerId || team?.u2?.metadata?.playerId === user?.metadata?.playerId;
        let rankU1 = team.u1.segments.find(s => s.attributes.playlistId === 11); //correspond à rank 2v2
        let rankU2 = team.u2.segments.find(s => s.attributes.playlistId === 11); //correspond à rank 2v2
        str += `
            <div class="col-md-6 mb-2">
                <div class="mb-1">Groupe ` + (ttTeam.indexOf(team) + 1) + (yourTeam ? '(votre groupe)' : '') + `</div>
                <div id="` + team?.u1?.metadata?.playerId + `" class="player-registered` + (team?.u1?.metadata?.playerId === user?.metadata?.playerId ? ' user-client' : '') + `">
                    <div class="d-flex align-items-center">    
                        <img class="img-rank" src="`+ (rankU1?.stats?.tier?.metadata?.iconUrl || '/assets/Logos/user_unknown.jpg') + `" alt="">
                        <span>`+ team?.u1?.platformInfo?.platformUserHandle + `</span>
                    </div>
                </div>
                <div id="` + team?.u2?.metadata?.playerId + `" class="player-registered` + (team?.u2?.metadata?.playerId === user?.metadata?.playerId ? ' user-client' : '') + `">
                    <div class="d-flex align-items-center">    
                        <img class="img-rank" src="`+ (rankU2?.stats?.tier?.metadata?.iconUrl || '/assets/Logos/user_unknown.jpg') + `" alt="">
                        <span>`+ team?.u2?.platformInfo?.platformUserHandle + `</span>
                    </div>
                </div>
            </div>`;
    });
    listPlayerRegisteredLastStep.innerHTML = str;
});