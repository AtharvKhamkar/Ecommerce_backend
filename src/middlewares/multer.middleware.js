import multer from "multer";
import sharp from "sharp";
import fs from "fs";


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "./public/temp")
    },
  filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random()* 1E9)
      cb(null, file.fieldname + '-' + uniqueSuffix+".jpeg")
    }
})
  
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true)
  } else {
    cb(
      {
        message: "Unsupported file format"
      },
      false
    );
  }
};
  
const upload = multer({
  storage:storage,
  fileFilter: multerFilter,
  limits:{fieldSize:2000000}
})

const productImageResize = async (req, res, next) => {
  if (!req.files) return next();
  await Promise.all(
    req.files.map(async (file) => {
      await sharp(file.path)
        .resize(300, 300)
        .toFormat("jpeg")
        .jpeg({ quality: 90 })
        .toFile(`public/temp/products/${file.filename}`);
    })
  );
  next();
}

const blogImageResize = async (req, res, next) => {
  if (!req.files) return next();
  await Promise.all(
    req.files.map(async (file) => {
      await sharp(file.path)
        .resize(300, 300)
        .toFormat("jpeg")
        .jpeg({ quality: 90 })
        .toFile(`public/temp/blogs/${file.filename}`)
      fs.unlinkSync(`public/temp/blogs/${file.filename}`)
      
    } )
  )
  next();
}

export { blogImageResize, productImageResize, upload };

