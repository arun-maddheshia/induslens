//@ts-nocheck
'use client';
import 'video.js/dist/video-js.css';

import React, { useEffect, useRef } from 'react';
import videojs from 'video.js';
import 'videojs-youtube';
import Player from 'video.js/dist/types/player';
import { cn } from '@/lib/utils';

interface VideoPlayerProps {
  videoId: string;
  className: string;
}

const initialOptions = {
  controls: true,
  fluid: true,
  controlBar: {
    volumePanel: {
      inline: false,
    },
  },
};

const VideoPlayer: React.FC<VideoPlayerProps> = ({ videoId, className }) => {
  const videoNode = useRef<HTMLVideoElement>(null);
  const player = useRef<Player>(null);
  const initialized = useRef<boolean>(false);

  const videoJsOptions = {
    sources: [
      {
        type: 'video/youtube',
        src: `https://www.youtube.com/watch?v=${videoId}`,
      },
    ],
  };

  useEffect(() => {
    if (videoNode.current && !initialized.current) {
      initialized.current = true;
      //@ts-ignore
      player.current = videojs(videoNode.current, {
        ...initialOptions,
        ...videoJsOptions,
      }).ready(function () {});
    }
    //clear up player on dismount
    return () => {
      if (player && player.current) {
        player.current.dispose();
      }
    };
  }, []);

  return <video ref={videoNode} className={cn('video-js', className)} />;
};

export default VideoPlayer;
