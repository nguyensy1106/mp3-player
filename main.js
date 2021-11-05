const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const PLAYER_STORAGE_KEY = 'MUSIC_PLAYER';
const localData = {
    isRandom: false,
    isRepeat: false
} 

const heading = $('header H2');
const cdThumb = $('.cd-thumb');
const audio = $('#audio');
const cd = $('.cd');
const playList = $('.playlist');
const playBtn = $('.btn-toggle-play');
const player = $('.player');
const progress = $('#progress');
const prevBtn = $('.btn-prev');
const nextBtn = $('.btn-next');
const randomBtn = $('.btn-random');
const repeatBtn = $('.btn-repeat');
const progressDuration = $('.progress__duration');
const progressCurrent = $('.progress__current');

const app = {
    currentIndex: 0,
    isPlaying: false,
    isRandom: false,
    isRepeat: false,
    config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || localData,
    songs: [
    {
      name: "Reality",
      singer: "Lost Frequencies",
      path: "./assets/music/Reality.mp3",
      image: "./assets/img/Reality.jpg",
    },
    {
      name: "Someone To You",
      singer: "Lost Frequencies",
      path: "./assets/music/SomeoneToYou.mp3",
      image: "./assets/img/SomeoneToYou.jpg",
    },
    {
      name: "Cưới Thôi",
      singer: "Lost Frequencies",
      path: "./assets/music/CuoiThoi.mp3",
      image: "./assets/img/cuoi-thoi.jpg",
    },
    {
      name: "3107",
      singer: "Cover",
      path: "./assets/music/3107.mp3",
      image: "./assets/img/3107.jpg",
    },
    {
      name: "Muộn Rồi Mà Sao Còn",
      singer: "Sơn Tùng MTP",
      path: "./assets/music/MuonRoiMaSaoCon.mp3",
      image: "./assets/img/MuonRoiMaSaoCon.jpg",
    },
    {
      name: "Rồi Tới Luôn",
      singer: "Nal",
      path: "./assets/music/RoiToiLuon.mp3",
      image: "./assets/img/RoiToiLuon.jpg",
    },
    {
      name: "Trên Tình Bạn Dưới Tình Yêu",
      singer: "Min",
      path: "./assets/music/TrenTinhBanDuoiTinhYeu-MIN-6802163.mp3",
      image: "./assets/img/tren-tinh-ban-duoi-tinh-yeu.jpg",
    },
    ],
    setConfig: function (key, value) {
        this.config[key] = value;
        localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config))
    },
    render: function () {
        const htmls = this.songs.map((song, index) => {
            return `
                    <div class="song ${index === this.currentIndex ? 'active' : ''}" 
                            data-index ="${index}">
                        <div class="thumb"
                            style="background-image: url('${song.image}')">
                        </div>
                        <div class="body">
                            <h3 class="title">${song.name}</h3>
                            <p class="author">${song.singer}</p>
                        </div>
                        <div class="option">
                            <i class="fas fa-ellipsis-h"></i>
                        </div>
                    </div>
            `;
        });
        playList.innerHTML = htmls.join('');
    },
    defineProperties: function () {
        Object.defineProperty(this, 'currentSong', {
            get: function() {
                return this.songs[this.currentIndex];
            }
        })
    },
    handleEvents: function () {
        const _this = this;
        const cdWidth = cd.offsetWidth;
        
        //CD dừng hoặc quay
        const cdThumbAnimate = cdThumb.animate([
            { transform: 'rotate(360deg)'}
        ], {
            duration: 10000,
            iterations: Infinity,
        });
        cdThumbAnimate.pause();

        //Xử lý phóng to/Thu nhỏ CD
        document.onscroll = function () {
            const scrollTop = window.scrollY || document.documentElement.scrollTop;
            const newCdWidth = cdWidth - scrollTop;
            cd.style.width = newCdWidth > 0 ? newCdWidth + 'px' : 0;
            cd.style.opacity = newCdWidth / cdWidth;
        }

        //Xử lý khi click play
        playBtn.onclick = function () {
            if( _this.isPlaying) {
                audio.pause();
            } else {
                audio.play();
            }
        }
        
        //Khi song được play
        audio.onplay = function () {
            _this.isPlaying = true;
            player.classList.add('playing');
            cdThumbAnimate.play();
            timeDuration = audio.duration;
            minDura = Math.floor(timeDuration / 60);
            secDura = Math.floor(timeDuration - minDura * 60);
            htmlDuration = _this.convertTimeToMinSec(minDura,'0',2) 
                                + ':'
                                + _this.convertTimeToMinSec(secDura,'0',2);
            progressDuration.innerHTML = htmlDuration;
        }
        audio.ondurationchange = function () {
            timeDuration = audio.duration;
            minDura = Math.floor(timeDuration / 60);
            secDura = Math.floor(timeDuration - minDura * 60);
            htmlDuration = _this.convertTimeToMinSec(minDura,'0',2) 
                                + ':'
                                + _this.convertTimeToMinSec(secDura,'0',2);
            progressDuration.innerHTML = htmlDuration;
        }

        //Khi song bị pause
        audio.onpause = function () {
            _this.isPlaying = false;
            player.classList.remove('playing');
            cdThumbAnimate.pause();
        }

        //Khi tiến độ bài hát thay đổi
        audio.ontimeupdate = function () {
            if(audio.duration) {
                const progressPercent = Math.floor(audio.currentTime / audio.duration * 100 );
                progress.value = progressPercent;
            }
            timeCurrent = audio.currentTime;
            mincurrent = Math.floor(timeCurrent / 60);
            secCurrent = Math.floor(timeCurrent - mincurrent * 60);
            htmlCurrent = _this.convertTimeToMinSec(mincurrent,'0',2) 
                                + ':'
                                + _this.convertTimeToMinSec(secCurrent,'0',2);
            progressCurrent.innerHTML = htmlCurrent;
        }

        // Xử lý thay kéo thời gian
        progress.onchange = function (e) {
            const seekTime = e.target.value * audio.duration / 100;
            audio.currentTime = seekTime;
        }

        //Next song
        nextBtn.onclick = function () {
            if(_this.isRandom) {
                _this.playRandomSong();
            } else {
                _this.nextSong();
            }
            audio.play();
            _this.render();
            _this.scrollActiveToSong();
        }
        
        //Prev song
        prevBtn.onclick = function () {
            if(_this.isRandom) {
                _this.playRandomSong();
            } else {
                _this.prevSong();
            }
            audio.play();
            _this.render();
            _this.scrollActiveToSong();
        }

        // random song
        randomBtn.onclick = function () {
            _this.isRandom = !_this.isRandom;
            _this.setConfig('isRandom', _this.isRandom);
            randomBtn.classList.toggle('active', _this.isRandom);
        }

        // Xử lý next song khi audio ended
        audio.onended = function () {
           if(_this.isRepeat) {
                audio.play();
           } else {
                nextBtn.click();
           }
        }

        // xử lý lặp lại song
        repeatBtn.onclick = function () {
            _this.isRepeat = !_this.isRepeat;
            _this.setConfig('isRepeat', _this.isRepeat);
            repeatBtn.classList.toggle('active', _this.isRepeat);
        }

        // lắng nghe click vào play list
        playList.onclick = function (e) {
            var songNode = e.target.closest('.song:not(.active)');
            if(songNode || e.target.closest('.option')) {
                
                // xử lý khi click vào song
                if(songNode) {
                   _this.currentIndex = Number(songNode.dataset.index);
                   _this.loadCurrentSong();
                   audio.play();
                   _this.render();
                }
                
                // xử lý khi click vào option
                if(e.target.closest('.option')) {
                    
                }

            }
        }
      },
    loadCurrentSong: function () {
        heading.textContent = this.currentSong.name;
        cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`;
        audio.src = this.currentSong.path;
    },
    convertTimeToMinSec: function(string,pad,length) {
        return (new Array(length+1).join(pad)+string).slice(-length);
    },    
    loadConfig: function () {
        this.isRandom = this.config.isRandom;
        this.isRepeat = this.config.isRepeat;
    },
    nextSong: function () {
        this.currentIndex++;
        if(this.currentIndex >= this.songs.length)
            this.currentIndex = 0;
        this.loadCurrentSong();
    },
    prevSong: function () {
        this.currentIndex--;
        if(this.currentIndex < 0)
            this.currentIndex = this.songs.length - 1;
        this.loadCurrentSong();
    },
    playRandomSong: function () {
        let newIndex;
        do {
            newIndex = Math.floor(Math.random() * this.songs.length)
        } while(newIndex === this.currentIndex)
        this.currentIndex = newIndex;
        this.loadCurrentSong();
    },
    scrollActiveToSong: function () {
        setTimeout( () => {
            $('.song.active').scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
        }, 300)
    },
    start: function () {
        // gắn cấu hình lưu vào object
        this.loadConfig();

        // Định nghĩa các thuộc tính cho object
        this.defineProperties();

        // Lắng nghe && xử lý các sự kiện (DOM event)
        this.handleEvents();

        // Loading bài hát đầu tiên trong UI
        this.loadCurrentSong();

        // Render playlist
        this.render();

        repeatBtn.classList.toggle('active', this.isRepeat);
        randomBtn.classList.toggle('active', this.isRandom);
    },
};

app.start();
