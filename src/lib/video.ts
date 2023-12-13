export const stopStreamedVideo = (video: HTMLVideoElement) => {
  video.pause();
  // @ts-expect-error
  const tracks: any[] = video.srcObject?.getTracks() || [];

  tracks.forEach((track) => {
    track.stop();
  });
};
