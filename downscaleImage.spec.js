import downscaleImage from "./downscaleImage.js";

describe("function: downscaleImage", () => {
  it("should be function", () => {
    expect(typeof downscaleImage).toBe("function");
  });
  it("should be rejected without File", async () => {
    const blob = new Blob();
    await expectAsync(downscaleImage(blob)).toBeRejectedWithError(TypeError);
  });
  it("should be rejected with invalid quality option", async () => {
    const file = new File([], "");
    for (const quality of [-1, 2, NaN, Infinity]) {
      await expectAsync(downscaleImage(file, {quality})).toBeRejectedWithError(
        TypeError
      );
    }
  });
  it("should be resolved with valid File", async () => {
    const response = await fetch("/base/sample.jpg");
    const blob = await response.blob();
    const file = new File([blob], "sample.jpg", {type: "image/jpeg"});
    await expectAsync(downscaleImage(file)).toBeResolved();
  });
  it("should be resolved with targetWidth option", async () => {
    const response = await fetch("/base/sample.jpg");
    const blob = await response.blob();
    const file = new File([blob], "sample.jpg", {type: "image/jpeg"});
    const targetWidth = 640;
    const result = await downscaleImage(file, {targetWidth});
    const objectURL = URL.createObjectURL(result);
    const image = new Image();
    image.src = objectURL;
    await image.decode();
    document.body.appendChild(image);
    expect(image.width).toBe(targetWidth);
  });
  it("should be resolved with returnType option", async () => {
    const response = await fetch("/base/sample.jpg");
    const blob = await response.blob();
    const file = new File([blob], "sample.jpg", {type: "image/jpeg"});
    const returnType = "dataURL";
    const result = await downscaleImage(file, {returnType});
    const image = new Image();
    image.src = result;
    await image.decode();
    document.body.appendChild(image);
    expect(image.width).toBe(1280);
  });
});
