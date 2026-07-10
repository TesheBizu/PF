export function setCircularFavicon(imgUrl) {
  const link = document.querySelector("link[rel~='icon']");
  const appleLink = document.querySelector("link[rel~='apple-touch-icon']");
  if (!link) return;

  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');

  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.onload = () => {
    ctx.clearRect(0, 0, 64, 64);
    ctx.beginPath();
    ctx.arc(32, 32, 31, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(img, 0, 0, 64, 64);
    const dataUrl = canvas.toDataURL('image/png');
    link.href = dataUrl;
    if (appleLink) appleLink.href = dataUrl;
  };
  img.onerror = () => {
    link.href = imgUrl;
    if (appleLink) appleLink.href = imgUrl;
  };
  img.src = imgUrl;
}
