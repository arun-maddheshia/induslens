// types/videojs-youtube.d.ts
// import 'video.js';

declare module 'videojs-youtube' {
  interface YouTubeOptions {
    iv_load_policy?: number;
    modestbranding?: number;
  }

  const videojsYouTube: (options?: YouTubeOptions) => void;
  export default videojsYouTube;
}
