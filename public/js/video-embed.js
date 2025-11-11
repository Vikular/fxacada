// Usage: <div class="video-embed" data-provider="youtube" data-id="VIDEO_ID"></div>
// Later, swap provider to vimeo and set data-id to Vimeo video ID

function renderVideoEmbeds() {
  document.querySelectorAll('.video-embed').forEach(div => {
    const provider = div.dataset.provider || 'youtube';
    const id = div.dataset.id;
    let embed = '';
    if (provider === 'youtube' && id) {
      embed = `<iframe width="100%" height="360" src="https://www.youtube.com/embed/${id}" frameborder="0" allowfullscreen allow="autoplay; encrypted-media"></iframe>`;
    } else if (provider === 'vimeo' && id) {
      embed = `<iframe src="https://player.vimeo.com/video/${id}" width="100%" height="360" frameborder="0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>`;
    } else {
      embed = '<div class="video-error">Video unavailable</div>';
    }
    div.innerHTML = embed;
  });
}

document.addEventListener('DOMContentLoaded', renderVideoEmbeds);
