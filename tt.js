require('dotenv').config()
const fetch = require('node-fetch')
const FormData = require('form-data')
// var formdata = new FormData();


async function uploadDiscord(file, fileName) {
    fileName = `SPOILER_`+fileName
    const form = new FormData();
    // form.append('content', "New Snapchat Image")
    form.append("payload_json", `{\"content\":\"New Snapchat Image\",\"files\":[{\"id\":0,\"fileName\":\"${fileName}\",\"description\":\"Snapchat Image\"}]}`);
    form.append("files[0]", file, fileName);    
    console.log(form.getBoundary())

fetch(process.env.WEBHOOK_URL,  {
    method: 'POST',
    body: form,
    redirect: 'follow'
  })
  .then(response => response.text())
  .then(result => console.log(result))
  .catch(error => console.log('error', error));
}

uploadDiscord(Buffer.from('file.txt'), 'file.txt').then(console.log).catch(console.error)