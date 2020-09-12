async function downscaleImage(
  file,
  {
    mimeType = "image/jpeg",
    quality = 0.8,
    returnType = "blob",
    targetWidth = 1280
  } = {}
) {
  if (!(file instanceof File)) {
    throw new TypeError("file should be instance of File");
  } else if (!file.type.startsWith("image/")) {
    throw new TypeError("file type sholud be starts with image/");
  } else if (!mimeType.startsWith("image/")) {
    throw new TypeError("mime type sholud be starts with image/");
  } else if (!Number.isFinite(quality) || quality < 0 || quality > 1) {
    throw new TypeError("quality should be finite number between 0 and 1");
  } else if (!Number.isFinite(targetWidth)) {
    throw new TypeError("target width should be finite number");
  } else if (!["blob", "dataURL"].includes(returnType)) {
    throw new TypeError("return type should be one of blob or dataURL");
  }
  const image = new Image();
  const objectURL = window.URL.createObjectURL(file);
  image.src = objectURL;
  if (image.decode === undefined) {
    image.decode = () =>
      new Promise((resolve) => image.addEventListener("load", resolve));
  }
  await image.decode();
  const ratio = image.height / image.width;
  const width = Math.min(targetWidth, image.width);
  const height = width * ratio;
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  Object.assign(canvas, {width, height});
  if (ctx.imageSmoothingQuality !== undefined) {
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(image, 0, 0, width, height);
  } else {
    const offscreenCanvas = document.createElement("canvas");
    const offscreenCtx = offscreenCanvas.getContext("2d");
    Object.assign(offscreenCanvas, {
      width: image.width,
      height: image.height
    });
    offscreenCtx.drawImage(image, 0, 0);
    const total = Math.max(
      Math.floor(Math.log(image.width / width) / Math.log(2)),
      0
    );
    const iteration = {total, count: total};
    while (iteration.count-- > 0) {
      offscreenCtx.drawImage(
        offscreenCanvas,
        0,
        0,
        offscreenCanvas.width * 0.5,
        offscreenCanvas.height * 0.5
      );
    }
    const offscreenWidth = offscreenCanvas.width * 0.5 ** iteration.total;
    const offscreenHeight = offscreenCanvas.height * 0.5 ** iteration.total;
    ctx.drawImage(
      offscreenCanvas,
      0,
      0,
      offscreenWidth,
      offscreenHeight,
      0,
      0,
      width,
      height
    );
  }
  window.URL.revokeObjectURL(objectURL);
  if (returnType === "blob") {
    if (canvas.toBlob === undefined && typeof canvas.msToBlob === "function") {
      canvas.toBlob = (resolve) => resolve(canvas.msToBlob());
    }
    return new Promise((resolve) => canvas.toBlob(resolve, mimeType, quality));
  } else if (returnType === "dataURL") {
    return canvas.toDataURL(mimeType, quality);
  }
}
