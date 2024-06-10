const express = require("express");
const router = express.Router();
const Product = require('../models/products');
const multer = require("multer");
const fs = require("fs");
const { title } = require("process");
const products = require("../models/products");
const { type } = require("os");

// Ensure the uploads directory exists
const uploadDir = "./uploads";
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// Image upload configuration
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const filename = file.fieldname + "_" + Date.now() + "_" + file.originalname;
        console.log("Saving file as:", filename); // Log the filename
        cb(null, filename);
    }
});

var upload = multer({
    storage: storage
}).single("image");

// Insert product to database
router.post('/add', upload, async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded.", type: 'danger' });
        }

        const product = new Product({
            name: req.body.name,
            descript: req.body.description,
            price: req.body.price,
            image: req.file.filename
        });

        await product.save(); // Using async/await instead of callback

        req.session.message = {
            type: 'success',
            message: 'Product added successfully!'
        };
        res.redirect("/");
    } catch (err) {
        res.json({ message: err.message, type: 'danger' });
    }
});

// Get All product route
// Get All product route
router.get("/", async (req, res) => {
    try {
        const products = await Product.find().exec();
        res.render("index", {
            title: "Home Page",
            products: products,
        });
    } catch (err) {
        res.json({ message: err.message });
    }
});


router.get("/add", (req, res) => {
    res.render("add_products", { title: "Add Products" });
});

// edit product
// Chỉnh sửa sản phẩm
router.get('/edit/:id', async (req, res, next) => {
    try {
      const id = req.params.id; // Lấy id từ tham số URL
      
      // Tìm sản phẩm theo ID sử dụng Promise
      const product = await Product.findById(id).exec();
      
      if (!product) {
        // Nếu không tìm thấy sản phẩm, chuyển hướng về trang chính
        return res.redirect('/');
      }
  
      // Nếu tìm thấy sản phẩm, trả về trang chỉnh sửa sản phẩm (render view hoặc trả JSON)
      res.render('edit_product', { title: "Edit Product", product }); // Giả sử bạn có một view tên là 'edit_product'
      
    } catch (err) {
      // Nếu có lỗi, chuyển lỗi cho middleware xử lý lỗi của Express
      next(err);
    }
  });

  // update user route

// Cập nhật thông tin sản phẩm
router.post("/update/:id", upload, async (req, res) => {
    try {
        let id = req.params.id;
        let new_image = "";
        if (req.file) {
            new_image = req.file.filename; // Sửa đổi từ fieldname thành filename
            try {
                fs.unlinkSync("./uploads/" + req.body.old_image);
            } catch (err) {
                console.log(err);
            }
        } else {
            new_image = req.body.old_image;
        }

        const updatedProduct = await Product.findByIdAndUpdate(id, {
            name: req.body.name,
            descript: req.body.description,
            price: req.body.price,
            image: new_image,
        }, { new: true });

        if (!updatedProduct) {
            return res.json({ message: "Product not found", type: "danger" });
        }

        req.session.message = {
            type: "success",
            message: "Product Updated Successfully",
        };

        res.redirect("/");
    } catch (err) {
        res.json({ message: err.message, type: "danger" });
    }
});


// Delete

router.get('/delete/:id', async (req, res) => {
    try {
        let id = req.params.id;
        const product = await Product.findByIdAndDelete(id);

        if (!product) {
            return res.json({ message: "Product not found" });
        }

        if (product.image) {
            try {
                fs.unlinkSync('./uploads/' + product.image);
                console.log('Deleted image:', product.image);
            } catch (err) {
                console.log(err);
            }
        }

        req.session.message = {
            type: 'info',
            message: 'Product Deleted Successfully!'
        };
        res.redirect('/');
    } catch (err) {
        res.json({ message: err.message });
    }
});


  

module.exports = router;






