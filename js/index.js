// 参考案例：http://zxt_team.gitee.io/qq-music-player/

//解决 click  事件的300ms延迟
FastClick.attach(document.body);

(async function () {
    const baseBox = document.querySelector('.header-box .base'),
        playerButton = document.querySelector('.player-button'),
        wrapperBox = document.querySelector('.wrapper'),
        footerBox = document.querySelector('.footer-box'),
        currentBox = footerBox.querySelector('.current'),
        durationBox = footerBox.querySelector('.duration'),
        alreadyBox = footerBox.querySelector('.already'),
        markImageBox = document.querySelector('.mark-image'),
        loadingBox = document.querySelector('.loading-box'),
        audioBox = document.querySelector('#audioBox')
    let wrapperList = [],
        timer = null,
        matchNum = 0//记录历史匹配的数量

    //音乐控制
    const format = function format(time) {
        let minutes = Math.floor(time / 60),
            seconds = Math.round(time - minutes * 60)
        minutes = minutes < 10 ? "0" + minutes : '' + minutes
        seconds = seconds < 10 ? "0" + seconds : '' + seconds
        return {
            minutes,
            seconds
        }
    }
    const playend = function playend() {
        clearInterval(timer)
        timer = null
        currentBox.innerHTML = "00:00"
        alreadyBox.style.width = '0%'
        wrapperBox.style.transform = 'translateY(0)'
        wrapperList.forEach(item => item.className = '')
        matchNum = 0
        playerButton.className = 'player-button'
    }
    const handle = function handle() {
        let pH = wrapperList[0].offsetHeight
        let { currentTime, duration } = audioBox
        if (isNaN(currentTime) || isNaN(duration)) return
        if (currentTime >= duration) {
            playend()
            return
        }
        let { minutes: currentTimeMinutes, seconds: currentTimeSeconds } = format(currentTime),
            { minutes: durationMinutes, seconds: durationSeconds } = format(duration),
            ratio = currentTime / duration * 100
        // 控制进度条
        currentBox.innerHTML = `${currentTimeMinutes}:${currentTimeSeconds}`
        durationBox.innerHTML = `${durationMinutes}:${durationSeconds}`
        alreadyBox.style.width = `${ratio}%`
        //控制歌词
        let matchs = wrapperList.filter(item => {
            let minutes = item.getAttribute('minutes'),
                seconds = item.getAttribute('seconds')
            return minutes === currentTimeMinutes && seconds === currentTimeSeconds
        })
        if (matchs.length > 0) {

            wrapperList.forEach(item => {
                item.className = ""
            })
            matchs.forEach(item => item.className = 'active')
            matchNum += matchs.length
            if (matchNum > 3) {
                let offset = (matchNum - 3) * pH
                wrapperBox.style.transform = `translateY(${-offset}px)`
            }
        }
    }
    playerButton.addEventListener('click', function () {
        if (audioBox.paused) {
            //当前是暂停的：我们让其播放
            audioBox.play()
            playerButton.style.backgroundPosition = "0rem -2.39rem"
            handle()
            if (!timer) timer = setInterval(handle, 1000)
            return
        }
        //当前是播放的：我们让其暂停
        audioBox.pause()
        playerButton.style.backgroundPosition = "0rem -2rem"
        clearInterval(timer)
        timer = null
    })

    const bindLyric = function bindLyric(lyric) {
        lyric = lyric.replace(/&#(\d+);/g, (value, $1) => {
            let instead = value
            switch (+$1) {
                case 32:
                    instead = " "
                    break;
                case 40:
                    instead = "（"
                    break
                case 41:
                    instead = "）"
                    break
                case 45:
                    instead = '-'
                    break
                default:

            }
            return instead
        })
        //解析歌词
        let arr = []
        lyric.replace(
            /\[(\d+)&#58;(\d+)&#46;(?:\d+)\]([^&#?]+)(?:&#10;)?/g,
            (_, $1, $2, $3) => {
                arr.push({
                    minutes: $1,
                    seconds: $2,
                    text: $3
                })
            }
        )
        //歌词绑定
        let str = ``
        arr.forEach(({ minutes, seconds, text }) => {
            str += `<p minutes="${minutes}" seconds="${seconds}">
            ${text}
            </p>`
        })
        wrapperBox.innerHTML = str
        //获取所有的P标签
        wrapperList = Array.from(wrapperBox.querySelectorAll('p'))

    }
    // 添加拖拽进度条的功能
    const progress = document.querySelector('.already');
    const progressBarBg = document.querySelector('.progress');
    const bar = document.querySelector('.bar');;

    let isDragging = false;

    bar.addEventListener('mousedown', () => {
        isDragging = true;
    });

    bar.addEventListener('mousemove', (event) => {
        if (isDragging) {
            const barWidth = progressBarBg.offsetWidth;
            const offsetX = event.offsetX;
            const progressPercentage = (offsetX / barWidth) * 100;
            progress.style.width = `${progressPercentage}%`;
        }
    });

    document.addEventListener('mouseup', () => {
        if (isDragging) {
            isDragging = false;
            const barWidth = progressBarBg.offsetWidth;
            const progressPercentage = (progress.offsetWidth / barWidth) * 100;
            const duration = audioBox.duration;
            const newCurrentTime = (duration * progressPercentage) / 100;
            audioBox.currentTime = newCurrentTime;
        }
    });
    //绑定数据
    const binding = function binding(data) {
        let { title, author, duration, pic, audio, lyric } = data
        //@1 绑定头部的基本信息
        baseBox.innerHTML = `<div class="cover">
        <img src="${pic}" alt="">
    </div>
    <div class="info">
        <h2 class="title">${title}</h2>
        <h3 class="author">${author}</h3>
    </div>`
        //@2 杂七杂八的绑定信息
        durationBox.innerHTML = duration
        markImageBox.style.backgroundImage = `url(${pic})`
        audioBox.src = audio

        bindLyric(lyric)

        loadingBox.style.display = 'none'
    }

    try {
        let { code, data } = await API.queryLyric()
        if (+code == 0) {
            //请求成功：业务层和网络都成功
            binding(data)
            return
        }
    }
    catch (_) { }
    alert('网络繁忙，请刷新页面')
})()