const Jimp = require('jimp');

async function convertImage() {
  try {
    const image = await Jimp.read('assets/images/icon.png');
    await image.writeAsync('assets/images/icon.png');
    console.log('Successfully converted icon.png to a real PNG.');
  } catch (error) {
    console.error('Error converting image:', error);
  }
}

convertImage();
