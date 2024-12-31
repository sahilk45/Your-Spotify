console.log("Hello welcome to Spotify!")

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}

let currentSong = new Audio();
let songs;
let currFolder;

async function getSongs(folder) {
    currFolder = folder;
    let a = await fetch(`/${folder}/`)
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response
    let as = div.getElementsByTagName("a")
    songs = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1])
        }
    }

    //showing all songs inplaylist:
    let songUL = document.querySelector(".songlist").getElementsByTagName("ul")[0]
    songUL.innerHTML = ""
    for (const song of songs) {
        songUL.innerHTML = songUL.innerHTML + `<li>
                            <img class="invert" src="img/music.svg" alt="musicsvg">
                            <div class="info">
                                <div>${song.replaceAll("%20", " ")}</div>
                                <div>Sahil</div>
                            </div>
                            <div class="playnow">
                                <span>Play now</span>
                                <img class="invert" src="img/play.svg" alt="playimg">
                            </div></li>`
    }

    //attach an event listner to each song:
    Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            playmusic(e.querySelector(".info").firstElementChild.innerHTML.trim())
        })
    })
}

const playmusic = (track, pause = false) => {
    // let audio = new Audio("/songs/" + track)
    currentSong.src = `/${currFolder}/` + track
    if (!pause) {

        currentSong.play()
        play.src = "img/pause.svg"
    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track)
    document.querySelector(".songtime").innerHTML = "00:00"
}

//show all card with title,description ,play sign
async function displayAlbums() {
    let a = await fetch(`songs/`)
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a")
    let cardcontainer = document.querySelector(".cardcontainer")
    let array = Array.from(anchors)
    for (let index = 0; index < array.length; index++) {
        const e = array[index];
        if (e.href.includes("songs") && !e.href.includes(".htaccess")) {
            let folder = e.href.split("/").slice(-2)[0]
            //Get metadata of the folder:
            let a = await fetch(`songs/${folder}/info.json`)
            let response = await a.json();
            // console.log(response)
            cardcontainer.innerHTML = cardcontainer.innerHTML +
                `<div data-folder="${folder}" class="card">
                        <div class="play">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 30" width="40" height="40">
                                <circle cx="15" cy="15" r="15" fill="#1fdf64" />
                                <path
                                    d="M20.8906 15.846C20.5371 17.189 18.8667 18.138 15.5257 20.0361C12.296 21.8709 10.6812 22.7884 9.37983 22.4196C8.8418 22.2671 8.35159 21.9776 7.95624 21.5787C7 20.6139 7 18.7426 7 15C7 11.2574 7 9.3861 7.95624 8.42132C8.35159 8.02245 8.8418 7.73288 9.37983 7.58042C10.6812 7.21165 12.296 8.12907 15.5257 9.96393C18.8667 11.86197 20.5371 12.811 20.8906 14.154C21.0365 14.7084 21.0365 15.2916 20.8906 15.846Z"
                                    fill="#000000" transform="translate(2, 1)" />
                            </svg>
                        </div>
                        <img src="songs/${folder}/cover.jpg" alt="img">
                        <h2>${response.title}</h2>
                        <p>${response.description}</p>
                    </div>`
        }
    }

    //Load the playlist when card is clicked:
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            songs = await getsongs(`songs/${item.currentTarget.dataset.folder}`)

        })
    })
}

async function main() {

    //list of all songs
    await getsongs("songs/ncs")
    playmusic(songs[0], true)

    //Display all the albums on the page:
    displayAlbums()

    // attach n event listner to previous, play and next:
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play()
            play.src = "img/pause.svg"
        }
        else {
            currentSong.pause()
            play.src = "img/play.svg"
        }
    })

    //Listen for time update event:
    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)}/${secondsToMinutesSeconds(currentSong.duration)}`
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%"
    })

    //Add an event listner to seek bar:
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100
        document.querySelector(".circle").style.left = percent + "%"
        currentSong.currentTime = (currentSong.duration * percent) / 100
    })

    //Add an event listner for hampburger:
    document.querySelector(".hampburgercont").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0"
    })

    //Add an event listner for close button:
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%"
    })

    //Add event listner to previous:
    previous.addEventListener("click", () => {
        console.log("previous clicked")

        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if ([index - 1] >= 0) {
            playmusic(songs[index - 1])
        }
    })

    //Add event listner to next:
    next.addEventListener("click", () => {
        console.log("next clicked")

        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if ([index + 1] < songs.length) {
            playmusic(songs[index + 1])
        }
    })

    //Add an event listner to volume:
    document.querySelector(".range").getElementsByTagName("input")[0], addEventListener("change", (e) => {
        console.log("Setting volume to", e.target.value, "/100")
        currentSong.volume = parseInt(e.target.value) / 100
        if (currentSong.volume > 0) {
            document.querySelector(".volume >img").src = document.querySelector(".volume >img").src.replace("mute.svg", "volume.svg")
        }
    })

    //Add event listner to mute the track:
    document.querySelector(".volume >img").addEventListener("click", e => {
        if (e.target.src.includes("volume.svg")) {
            e.target.src = e.target.src.replace("volume.svg", "mute.svg")
            currentSong.volume = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0
        }
        else {
            e.target.src = e.target.src.replace("mute.svg", "volume.svg")
            currentSong.volume = .10
            document.querySelector(".range").getElementsByTagName("input")[0].value = 50
        }
    })

}
main()
