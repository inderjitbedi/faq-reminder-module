const router = require("express").Router();
const _ = require('lodash');
const multer = require('multer')
let fs = require('fs-extra');
const reader = require('xlsx')
const path = require('path');

const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        let path = `uploads/${file.fieldname}`;
        fs.mkdirsSync(path);
        callback(null, path);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + "_" + file.originalname.replaceAll(' ', '_'));
    },
    limits: { fileSize: 4000000 }, // 4MB

});

const uploadCover = multer({
    storage: storage, fileFilter: (req, file, cb) => {
        console.log(file)
        const filetypes = /jpeg|jpg|png/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Error: File must be of type jpeg|jpg|png!'));
        }
    }
})

const videoStorage = multer.diskStorage({
    destination: (req, file, callback) => {
        let path = `uploads/${file.fieldname}`;
        fs.mkdirsSync(path);
        callback(null, path);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + "_" + file.originalname.replaceAll(' ', '_'));
    },
    limits: { fileSize: 200000000 }, // 200MB

});
const uploadVideo = multer({
    storage: videoStorage, fileFilter: (req, file, cb) => {
        console.log(file)
        const filetypes = /mp4|ogg|webm/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Error: File must be of type mp4|ogg|webm!'));
        }
    }
})
const uploadAudio= multer({
    storage: videoStorage, fileFilter: (req, file, cb) => {
        console.log(file)
        const filetypes = /mp3|ogg|wav|mpeg/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Error: File must be of type mp3|ogg|wav|mpeg!'));
        }
    }
})

router.post('/upload', uploadCover.single('cover'), async (req, res) => {
    try {
        if (!req.file) {
            res.status(400).send({
                statusCode: 400,
                message: 'No file uploaded'
            });
        } else {
            res.status(200).send({
                statusCode: 200,
                message: 'File uploaded successfully',
                data: {
                    ...req.file
                }
            });
        }
    } catch (err) {
        res.status(400).send(err);
    }
});

router.post('/upload-video', uploadVideo.single('video'), async (req, res) => {
    try {
        if (!req.file) {
            res.status(400).send({
                statusCode: 400,
                message: 'No file uploaded'
            });
        } else {
            res.status(200).send({
                statusCode: 200,
                message: 'File uploaded successfully',
                data: {
                    ...req.file
                }
            });
        }
    } catch (err) {
        res.status(400).send(err);
    }
});


router.post('/upload-audio', uploadAudio.single('audio'), async (req, res) => {
    try {
        if (!req.file) {
            res.status(400).send({
                statusCode: 400,
                message: 'No file uploaded'
            });
        } else {
            res.status(200).send({
                statusCode: 200,
                message: 'File uploaded successfully',
                data: {
                    ...req.file
                }
            });
        }
    } catch (err) {
        res.status(400).send(err);
    }
});
const xlsxToJson = (filePath) => {
    try {
        const file = reader.readFile(filePath)
        let data = []
        const sheets = file.SheetNames
        for (let i = 0; i < sheets.length; i++) {
            const temp = reader.utils.sheet_to_json(file.Sheets[file.SheetNames[i]])
            temp.forEach((res) => {
                data.push(res)
            })
        }
        return data
    } catch (error) {
        return error;
    }
}

module.exports = router;