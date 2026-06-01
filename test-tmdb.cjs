const https = require('https');

const url = 'https://api.themoviedb.org/3/movie/550/images?api_key=b4324b67a08420e0a1d85a6c90314211&include_image_language=en,null,ar,fr';

https.get(url, (res) => {
  let data = '';
  res.on('data', chunk => { data += chunk; });
  res.on('end', () => {
    try {
      const parsed = JSON.parse(data);
      console.log('Logos count:', parsed.logos ? parsed.logos.length : 0);
      if (parsed.logos && parsed.logos.length > 0) {
        console.log('First logo:', parsed.logos[0].file_path);
      }
    } catch(e) {
      console.log('Error parsing JSON');
    }
  });
});
