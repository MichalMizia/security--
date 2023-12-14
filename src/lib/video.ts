export const stopStreamedVideo = (video: HTMLVideoElement) => {
  video.pause();
  const tracks = (video.srcObject as MediaStream).getTracks() || [];

  tracks.forEach((track) => {
    track.stop();
  });
};
