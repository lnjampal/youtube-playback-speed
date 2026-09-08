/**
 * Main World Script
 * Runs in YouTube's main JavaScript context.
 * Enables direct communication with YouTube's internal #movie_player API
 * so that native UI (gear menu) reflects the speed and player state stays synced.
 */
(function () {
  'use strict';

  const SET_SPEED_EVENT = 'yt-channel-speed:set';
  const GET_SPEED_EVENT = 'yt-channel-speed:get';
  const SPEED_RESPONSE_EVENT = 'yt-channel-speed:response';

  /**
   * Safely retrieve the YouTube player element
   */
  function getMoviePlayer() {
    return document.getElementById('movie_player') || document.querySelector('.html5-video-player');
  }

  /**
   * Apply playback speed using YouTube's internal player API and DOM fallback
   */
  function applySpeed(speed) {
    if (typeof speed !== 'number' || !Number.isFinite(speed) || speed < 0.1 || speed > 16.0) {
      return false;
    }

    const safeSpeed = Math.round(speed * 100) / 100;
    let applied = false;
    const player = getMoviePlayer();

    // 1. Try native YouTube player API
    if (player && typeof player.setPlaybackRate === 'function') {
      try {
        player.setPlaybackRate(safeSpeed);
        applied = true;
      } catch (err) {
        // Fallback below
      }
    }

    // 2. Direct video element synchronization
    const video = document.querySelector('video.html5-main-video') || document.querySelector('video');
    if (video) {
      try {
        if (Math.abs(video.playbackRate - safeSpeed) > 0.01) {
          video.playbackRate = safeSpeed;
        }
        applied = true;
      } catch (err) {
        // Ignored
      }
    }

    return applied;
  }

  /**
   * Listen for speed set requests from the isolated content script
   */
  window.addEventListener(SET_SPEED_EVENT, (event) => {
    if (event && event.detail && typeof event.detail.speed === 'number') {
      applySpeed(event.detail.speed);
    }
  });

  /**
   * Listen for speed query requests
   */
  window.addEventListener(GET_SPEED_EVENT, () => {
    let currentRate = 1.0;
    const player = getMoviePlayer();
    if (player && typeof player.getPlaybackRate === 'function') {
      try {
        currentRate = player.getPlaybackRate();
      } catch (e) {
        // Fallback
      }
    } else {
      const video = document.querySelector('video');
      if (video) {
        currentRate = video.playbackRate;
      }
    }

    window.dispatchEvent(
      new CustomEvent(SPEED_RESPONSE_EVENT, {
        detail: { playbackRate: currentRate },
      })
    );
  });

  /**
   * Listen for player video metadata query requests
   */
  const GET_PLAYER_DATA_EVENT = 'yt-channel-speed:get-player-data';
  const PLAYER_DATA_RESPONSE_EVENT = 'yt-channel-speed:player-data-response';

  window.addEventListener(GET_PLAYER_DATA_EVENT, () => {
    let videoId = null;
    let author = null;
    let title = null;
    const player = getMoviePlayer();
    if (player && typeof player.getVideoData === 'function') {
      try {
        const data = player.getVideoData();
        if (data) {
          videoId = data.video_id || null;
          author = data.author || null;
          title = data.title || null;
        }
      } catch (e) {
        // Fallback
      }
    }

    window.dispatchEvent(
      new CustomEvent(PLAYER_DATA_RESPONSE_EVENT, {
        detail: { videoId, author, title },
      })
    );
  });
})();
