const mongoose = require('mongoose');
const multer = require('multer');
const { GridFsStorage } = require('multer-gridfs-storage');
const Grid = require('gridfs-stream');
const crypto = require('crypto');
const path = require('path');

let gfs;
let gridfsBucket;

// Initialize GridFS when MongoDB connection is ready
mongoose.connection.once('open', () => {
    gridfsBucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
        bucketName: 'uploads'
    });
    gfs = Grid(mongoose.connection.db, mongoose.mongo);
    gfs.collection('uploads');
    console.log('GridFS initialized');
});

// Create storage engine
const storage = new GridFsStorage({
    url: process.env.MONGO_URI,
    options: { useNewUrlParser: true, useUnifiedTopology: true },
    file: (req, file) => {
        return new Promise((resolve, reject) => {
            crypto.randomBytes(16, (err, buf) => {
                if (err) {
                    return reject(err);
                }
                const filename = buf.toString('hex') + path.extname(file.originalname);
                const fileInfo = {
                    filename: filename,
                    bucketName: 'uploads',
                    metadata: {
                        originalName: file.originalname,
                        folderKey: req.body.folderKey || `${req.body.type}-${req.body.partyId}`,
                        uploadedBy: req.user ? req.user._id : null,
                        uploadedAt: new Date()
                    }
                };
                resolve(fileInfo);
            });
        });
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        // Accept images only
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif|webp)$/)) {
            return cb(new Error('Only image files are allowed!'), false);
        }
        cb(null, true);
    }
});

// Get GridFS bucket
const getGridFSBucket = () => gridfsBucket;

// Get GFS
const getGFS = () => gfs;

module.exports = { upload, getGridFSBucket, getGFS };
