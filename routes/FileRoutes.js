const router = require("express").Router();
const _ = require('lodash');
const multer = require('multer')
let fs = require('fs-extra');
const reader = require('xlsx')
const path = require('path');

const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        let path = `uploads/${file?.mimetype?.split('/')[1] || 'others'}`;
        fs.mkdirsSync(path);
        callback(null, path);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + "_" + file.originalname);
    },
    limits: { fileSize: 4000000 }, // 4MB

});
const upload = multer({
    storage: storage, fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|gif|xlsx|xls/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Error: File must be of type jpeg|jpg|png|gif|xlsx|xls!'));
        }
    }
})

router.post('/upload', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            res.send({
                statusCode: 400,
                message: 'No file uploaded'
            });
        } else {
            try {
                  var xlsxJson = xlsxToJson(path.join(process.cwd(), req.file.path));
            if (xlsxJson)
                res.send({
                    status: true,
                    message: 'File uploaded and converted to json successfully',
                    data: {
                        ...xlsxJson
                    }
                });
            } catch (error) {
                res.status(400).send(error);
            }
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