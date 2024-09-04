var MediaPlayer = function (el, index) {

    var self = this,
        media_player = el,
        video = el.querySelector('.made-player-video'),
        controls_bar,
        play_button,
        progress_bar,
        progress_text,
        sound_button,
        sound_bar,
        loading,
        full_screen_button,
        progressDrag = false,
        soundDrag = false,
        isClicking = false,
        isInFullscreen = false,
        click_timer,
        show_controls_timer,
        hide_controls_timer;

    function createControls() {

        var html = `<div class="${"media-player-controls customvideo"+index}"><button class="play-button"><i class="material-icons">play_arrow</i></button><progress class="progress-bar" min="0" max="100" value="0"></progress><span class="progress-text"></span><button class="sound-button"><i class="material-icons">volume_up</i></button><progress class="sound-bar" min="0" max="100" value="0"></progress><button class="fullscreen-button"><i class="material-icons">fullscreen</i></button></div>`;

        media_player.insertAdjacentHTML('beforeend', html);
    }

    function createLoader() {

        var html = '<div class="media-player-loading"><div class="loader"><div class="circle"></div><div class="circle"></div><div class="circle"></div></div></div>';

        media_player.insertAdjacentHTML('beforeend', html);
    }

    function showLoader() {
        loading.style.display = 'block';
    }

    function hideLoader() {
        loading.style.display = 'none';
    }

    function showControls() {

        if (isClicking || controls_bar.style.opacity == 1) return false;

        var opacity = 0,
            current_time = 0,
            duration = 300;

        clearInterval(show_controls_timer);
        show_controls_timer = setInterval(function () {
            controls_bar.style.opacity = opacity;

            opacity += .05;
            current_time += 16;
            if (opacity >= 1 && current_time >= duration) {
                controls_bar.style.opacity = 1;
                clearInterval(show_controls_timer);
                return false;
            }
        }, 16);
    }

    function hideControls() {

        if (isClicking || controls_bar.style.opacity == 0 || video.currentTime == video.duration || (video.currentTime == 0 && video.paused)) return false;

        var opacity = 1,
            current_time = 0,
            duration = 300;

        clearInterval(hide_controls_timer);
        hide_controls_timer = setInterval(function () {
            controls_bar.style.opacity = opacity;

            opacity -= .05;
            current_time += 16;
            if (opacity <= 0 && current_time >= duration) {
                controls_bar.style.opacity = 0;
                clearInterval(hide_controls_timer);
                return false;
            }
        }, 16);
    }

    function togglePlayPause() {

        launch_click_timer();

        if (video.paused || video.ended) {
            play_button.innerHTML = '<i class="material-icons">pause</i>';
            video.play();
        } else {
            play_button.innerHTML = '<i class="material-icons">play_arrow</i>';
            video.pause();
        }
    }

    function launch_click_timer() {
        isClicking = true;
        clearTimeout(click_timer);
        click_timer = setTimeout(function () {
            isClicking = false;
        }, 500);
    }

    function stop() {
        video.pause();
        video.currentTime = 0;
        play_button.innerHTML = '<i class="material-icons">play_arrow</i>';
        showControls(false);
    }

    function updateProgress() {
        var percentage = Math.floor((100 / video.duration) * video.currentTime);
        progress_bar.value = percentage;
        // progress_text.innerHTML = percentage + '%';
        progress_text.innerHTML = formatTime(video.currentTime);
    }

    function setProgress(e) {
        var offsetLeft = progress_bar.getBoundingClientRect().left;
        var position = e.pageX - offsetLeft;
        var percentage = 100 * position / progress_bar.clientWidth;

        if (percentage > 100) {
            percentage = 100;
        }
        if (percentage < 0) {
            percentage = 0;
        }

        video.currentTime = video.duration * percentage / 100;
    }

    function goTo(time) {

        if (time > video.duration) {
            time = video.duration;
        }

        video.currentTime = time;
    }

    function toggleMute(e) {

        launch_click_timer();

        if (video.muted) {
            video.muted = false;
            updateVolume_controls(video.volume);
        } else {
            video.muted = true;
            updateVolume_controls(0);
        }
    }

    function updateVolume(e) {
        var offsetLeft = sound_bar.getBoundingClientRect().left;
        var position = e.pageX - offsetLeft;
        var volume = position / sound_bar.clientWidth;

        setVolume(volume);
    }

    function setVolume(volume) {

        if (volume < .01) {
            volume = 0;
        }
        if (video.muted) {
            video.muted = false;
        }

        video.volume = volume;
        updateVolume_controls(volume);
    }

    function formatTime(time) { // 360.121313 secs

        // 1 heure = 3600 sec
        var hours = Math.floor(time / 3600);
        // 1 min = 60 sec
        var minutes = Math.floor((time - (hours * 3600)) / 60);
        var seconds = Math.floor(time - (hours * 3600) - (minutes * 60));

        var result = hours < 10 ? '0' + hours : hours;
        result += ':';
        result += minutes < 10 ? '0' + minutes : minutes;
        result += ':';
        result += seconds < 10 ? '0' + seconds : seconds;
        return result;
    };

    function updateVolume_controls(volume) {

        if (volume == 0) {
            sound_button.innerHTML = '<i class="material-icons">volume_off</i>';
        } else if (volume < .5) {
            sound_button.innerHTML = '<i class="material-icons">volume_down</i>';
        } else {
            sound_button.innerHTML = '<i class="material-icons">volume_up</i>';
        }

        sound_bar.value = volume * 100;
    }

    function init() {

        createControls();
        createLoader();

        controls_bar = document.querySelector(`.customvideo${index}.media-player-controls`);
        play_button = document.querySelector(`.customvideo${index} .play-button`);
        stop_button = document.querySelector(`.customvideo${index} .stop-button`);
        progress_bar = document.querySelector(`.customvideo${index} .progress-bar`);
        progress_text = document.querySelector(`.customvideo${index} .progress-text`);
        sound_button = document.querySelector(`.customvideo${index} .sound-button`);
        sound_bar = document.querySelector(`.customvideo${index} .sound-bar`);
        loading = document.querySelector(`.customvideo${index} .media-player-loading`);
        full_screen_button = document.querySelector(`.customvideo${index} .fullscreen-button`);

        // options
        video.controls = false;
        video.volume = .7;
        sound_bar.value = 70;
        progress_text.innerHTML = "00:00:00";

        // Loader
        video.addEventListener('waiting', showLoader);
        video.addEventListener('canplay', hideLoader);
        video.addEventListener('seeked', hideLoader);

        // Show / Hide controls
        video.addEventListener('loadedmetadata', showControls);
        media_player.addEventListener('mouseenter', showControls);
        media_player.addEventListener('mouseleave', hideControls);

        // user Play / Pause
        video.addEventListener('click', togglePlayPause);
        play_button.addEventListener('click', togglePlayPause);

        // progress
        video.addEventListener('timeupdate', updateProgress);
        // user change progress (drag, click)
        progress_bar.addEventListener('mousedown', function (e) {
            progressDrag = true;
        });
        document.addEventListener('mouseup', function (e) {
            if (progressDrag) {
                setProgress(e);
                progressDrag = false;
            }
            if (soundDrag) {
                soundDrag = false;
                updateVolume(e);
            }
        });
        document.addEventListener('mousemove', function (e) {
            if (progressDrag) {
                setProgress(e);
            }
            if (soundDrag) {
                updateVolume(e);
            }
        });
        progress_bar.addEventListener('click', updateProgress);

        // video ended
        video.addEventListener('ended', function () {
            // replay ?                       
            play_button.innerHTML = '<i class="material-icons">play_arrow</i>';
            showControls();
        });

        // Mute
        sound_button.addEventListener('click', toggleMute);
        // Volume change
        sound_bar.addEventListener('mousedown', function (e) {
            soundDrag = true;
        });
        sound_bar.addEventListener('click', updateVolume);

        // full screen
        full_screen_button.addEventListener('click', function () {

            if (video.webkitEnterFullscreen) {
                video.webkitEnterFullscreen();
            } else if (video.mozEnterFullscreen) {
                video.mozEnterFullscreen();
            } else {
                // no support
            }

        });
        video.addEventListener("mozfullscreenchange", function () {
            isInFullscreen = document.mozFullScreen;
        }, false);

        video.addEventListener("webkitfullscreenchange", function () {
            isInFullscreen = document.webkitIsFullScreen;
        }, false);

        // gestion du son en fullscreen
        video.addEventListener('volumechange', function () {
            if (isInFullscreen) {

                var volume = video.muted ? 0 : video.volume;
                sound_bar.value = volume * 100;

                if (volume == 0) {
                    sound_button.innerHTML = '<i class="material-icons">volume_off</i>';
                } else if (volume < .5) {
                    sound_button.innerHTML = '<i class="material-icons">volume_down</i>';
                } else {
                    sound_button.innerHTML = '<i class="material-icons">volume_up</i>';
                }
            }
        });
    }

    init();

    return {
        goTo: goTo,
        hideControls: hideControls,
        setVolume: setVolume,
        showControls: showControls,
        stop: stop,
        toggleMute: toggleMute,
        togglePlayPause: togglePlayPause,
        version: '0.1.0'
    }
}

/*
 * Code
 */
function initialize() {

    var el = document.querySelector('#rv1');
    var el2 = document.querySelector('#rv2')

    var mediaPlayer = new MediaPlayer(el, 1);
    var mediaPlayer = new MediaPlayer(el2, 2);

    var play_test_button = document.querySelector('.customvideo1 .play'),
        goto_test_button = document.querySelector('.customvideo1 .goto'),
        stop_test_button = document.querySelector('.customvideo1 .stop'),
        mute_test_button = document.querySelector('.customvideo1 .mute'),
        volume_test_button = document.querySelector('.customvideo1 .volume');
    var play_test_button = document.querySelector('.customvideo2 .play'),
        goto_test_button = document.querySelector('.customvideo2 .goto'),
        stop_test_button = document.querySelector('.customvideo2 .stop'),
        mute_test_button = document.querySelector('.customvideo2 .mute'),
        volume_test_button = document.querySelector('.customvideo2 .volume');

    play_test_button.addEventListener('click', function () {
        mediaPlayer.togglePlayPause();
    });

    goto_test_button.addEventListener('click', function () {
        mediaPlayer.goTo(30);
    });

    stop_test_button.addEventListener('click', function () {
        mediaPlayer.stop();
    });

    mute_test_button.addEventListener('click', function () {
        mediaPlayer.toggleMute();
    });

    volume_test_button.addEventListener('click', function () {
        mediaPlayer.setVolume(1);
    });
}

document.addEventListener('DOMContentLoaded', initialize);