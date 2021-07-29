let includeElement = document.getElementById('include-element');
let body = document.getElementsByTagName('body');

let ttPage = [
    { id: 1, url: 'home.html', backgroundUrl: '../assets/images/rocket-league.png' },
    { id: 2, url: 'join-tournament.html', backgroundUrl: '../assets/images/rocket-league-ultimate.jpeg' },
    { id: 3, url: 'last-step.html', backgroundUrl: '../assets/Images/rocket-league-adds-new-fast-and-furious-dlc_9gyn.1200.jpg' },
];

let userAdmin = false;
let ttUserRegistered = [];

/* let back = (pageId) => {
    includeHTML(pageId);
} */

includeHTML = (idPage) => {
    let page = ttPage.find(p => p.id === idPage);
    body[0].style.backgroundImage = 'url(' + page.backgroundUrl + ')';
    fetch('../' + page.url).then(res => {
        return res.text();
    }).then(res => {
        includeElement.innerHTML = res;
        if (page.id === 2) {
            getUser();
            setProfile();
        }
        if (page.id === 3) {
            initLastStep();
            setProfile();
        }
        let ttAdminElement = document.getElementsByClassName('admin-elements');
        for (let i = 0; i < ttAdminElement.length; i++) {
            ttAdminElement[i].style.visibility = userAdmin ? 'visible' : 'hidden';
        }
    });
}

let setProfile = () => {
    if (user) {
        let profileElem = document.getElementById('profile');
        let rank = user.segments.find(s => s.attributes.playlistId === 11); //correspond à rank 2v2
        let str = `
        <div class="d-flex justify-content-center">
            <div>
                <div>
                `+ user?.platformInfo?.platformUserHandle + `
                </div>
                <div class="subtitle-name">
                ` + (userAdmin ? 'Administrateur' : 'Participant') + `
                </div>
            </div>
        </div>
        `;
        profileElem.innerHTML = str;
    }
}