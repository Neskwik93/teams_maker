

let tt = [{ id: 1, value: 911 }, { id: 2, value: 853 }, { id: 3, value: 744 }, { id: 4, value: 1621 }, { id: 5, value: 805 }, { id: 6, value: 770 }, { id: 7, value: 829 }, { id: 8, value: 468 }, { id: 9, value: 1033 }, { id: 10, value: 1100 }];
let ttTeam = [];
let rankMoyen = 0;

tt.forEach(u => {
    rankMoyen += u.value
})

rankMoyen = rankMoyen / 10
console.log(rankMoyen)

tt.sort((a, b) => a.value - b.value)
console.log(tt)


//Premier test on boucle une premiere fois sur le tableau de joueur
//pour chaque joueur on boucle une seconde fois sur le tabeau de joueur
//on calcul le mmr moyen des deux joueurs on le stock
//on calcul le mmr moyen du premier joueur et du nouveau second joueur
//si le mmr moyen se rapproche plus du mmr moyen demandé on le remplace si non on continu
//résultat peu satisfaisant il faudrait de la récursivité pour rééquilibrer les équipes après coup
//car certaine équipe


tt.forEach(u => {
    let team;
    let teamRankMoyen;
    let oldDifference;
    if (!ttTeam.find(team => team && (team.u1.value === u.value || team.u2.value === u.value))) {
        for (let i = tt.length - 1; i > 0; i--) {
            let u2 = tt[i]
            if (u.id !== u2.id && !ttTeam.find(team => team && (team.u1.value === u2.value || team.u2.value === u2.value))) {
                let teamRankMoyenTmp = (u2.value + u.value) / 2;
                let difference = Math.abs(teamRankMoyenTmp - rankMoyen);
                if (!oldDifference || oldDifference > difference) {
                    oldDifference = difference;
                    teamRankMoyen = teamRankMoyenTmp;
                    team = { u1: u, u2: u2, mmrMoyen: teamRankMoyen };
                }
            }
        }
        ttTeam.push(team)
    }

});

console.log('ttTeam genéré: ', ttTeam)

let idCroissant = 0;
let idDecroissant = tt.length - 1;
let ttTeam2 = []

for (let i = 0; i < tt.length / 2; i++) {
    ttTeam2.push({ u1: tt[idCroissant], u2: tt[idDecroissant], mmrMoyen: (tt[idCroissant].value + tt[idDecroissant].value) / 2 });
    idCroissant++;
    idDecroissant--;
}
console.log('ttTeam ideal: ', ttTeam2)
console.log('mmrMoyen demandé ', rankMoyen)