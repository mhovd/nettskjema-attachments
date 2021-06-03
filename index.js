const axios = require('axios')
const fs = require('fs')
const path = require('path')
const cliProgress = require('cli-progress')
const {
  argv
} = require('yargs')

let formID = argv.form
if (!formID) {
  return console.log("Argument --form is required")
}

let token = argv.token
if (!token) {
  return console.log("Argument --token is required")
}

let submissions
let downloads = path.join(path.resolve(), "attachments", formID.toString())

if (!fs.existsSync(downloads)) {
  fs.mkdirSync(downloads, {
    recursive: true
  })
}

const progress = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
let attachmentList = []


console.log(downloads)
console.log("---------------- GETTING ATTACHMENTS FOR FORM ID " + formID + " ----------------" + "\n")

async function getList(formID) {
  const url = 'https://nettskjema.no/api/v2/forms/' + formID + '/submissions'
  try {
    const submissions = await axios.get(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      .then(response => response.data)

    for (const submission of submissions) {
      for (const answer of submission.answers) {
        if (answer.attachments) {
          let submissionId = submission.submissionId
          let attachId = (answer.attachments[0].answerAttachmentId)
          let obj = {
            'submissionId': submissionId,
            'attachId': attachId
          }
          attachmentList.push(obj)
        }
      }
    }
    getAttachments()
  } catch (error) {
    return console.log(`ERROR: ${error.response.data.message} (${error.response.data.statusCode})`)
  }
}

async function getAttachments() {
  progress.start(attachmentList.length, 0)

  for (const entry of attachmentList) {
    let url = 'https://nettskjema.no/api/v2/submissions/' + entry.submissionId + '/attachments/' + entry.attachId
    let response = await axios.get(url, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    let file_path = path.join(downloads, response.data.fileName)
    file_path = path.normalize(file_path)
    fs.writeFileSync(file_path, Buffer.from(response.data.content, 'base64'))
    progress.increment()
  }
  progress.stop()
  console.log(`\nFinished downloading ${attachmentList.length} attachments`)
}

getList(formID)