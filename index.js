const express = require('express')
const multer = require('multer')
const Tesseract = require('tesseract.js')
const path = require('path')
const fs = require('fs')

const app = express()
const port = process.env.PORT || 3030

app.use(express.static(path.join(__dirname, 'public')))

// Multer configuration for file upload
const storage = multer.diskStorage({
  destination: path.join(__dirname, 'uploads'),
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + '-' + Date.now() + path.extname(file.originalname)
    )
  },
})
const upload = multer({ storage })

// Route for uploading the image
app.post('/upload', upload.single('image'), (req, res) => {
  const imagePath = req.file.path

  // Perform OCR using Tesseract
  Tesseract.recognize(
    imagePath,
    'eng', // Language
    { logger: (info) => console.log(info) } // Logger function
  )
    .then(({ data: { text } }) => {
      res.json({ text })
      fs.unlinkSync(imagePath) // Delete the uploaded image
    })
    .catch((error) => {
      console.error(error.message)
      res.status(500).json({ error: 'An error occurred during OCR.' })
    })
})

app.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})
