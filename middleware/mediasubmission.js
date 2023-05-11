const multer = require('multer');
const path = require('path')

// Preparing multer middleware for image/video upload 
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads')
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
      cb(null, file.fieldname + '-' + uniqueSuffix+ path.extname(file.originalname))
    }
  })
  module.exports = multer(
    { 
      storage: storage,
      limits: {fileSize:4000000},
      fileFilter: function(_req, file, cb){
        checkFileType(file, cb);
    }
    });
    
    
    function checkFileType(file, cb){
      // Allowed ext
      const filetypes = /jpeg|jpg|png|gif/;
      // Check ext
      const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
      // Check mime
      const mimetype = filetypes.test(file.mimetype);
    
      if(mimetype && extname){
        return cb(null,true);
      } else {
        cb('Error: Images Only!');
      }
    }