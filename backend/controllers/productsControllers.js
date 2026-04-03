const products = require("../models/ProductsModel");
const sanitizeHTML = require("sanitize-html");

const addProducts = async (req, res) => {
  try {
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({ error: "Image is required" });
    }

    const cleanDescription = sanitizeHTML(req.body.description, {
      allowedTags: [
        "p",
        "b",
        "i",
        "em",
        "strong",
        "ul",
        "ol",
        "li",
        "br",
        "h1",
        "h2",
        "h3",
      ],
      allowedAttributes: {},
    });

    // Create a new product with image URL
    const newProduct = new products({
      name: req.body.name,
      description: cleanDescription,
      price: req.body.price,
      stock: req.body.stock,
      category: req.body.category,
      imageUrl: `/uploads/${req.file.filename}`, // Save the uploaded image path
      seller: req.user.id,
    });

    // Save to database
    await newProduct.save();
    res.status(201).json(newProduct);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getProducts = async (req, res) => {
  try {
    const product = await products.find({});
    return res.status(200).json(product);
  } catch (error) {
    return res.status(500).json({ msg: error });
  }
};

const getProduct = async (req, res) => {
  try {
    const productID = req.params.id;
    const product = await products.findOne({ _id: productID });
    if (!product) {
      return res
        .status(404)
        .json({ msg: `No Data found with id: {productID}` });
    }
    return res.status(200).json(product);
  } catch (error) {
    return res.status(500).json({ msg: error });
  }
};

const updateProduct = async (req, res) => {
  try {
    const productID = req.params.id;

    // 🔐 OWNERSHIP CHECK
    const product = await products.findOne({
      _id: productID,
      seller: req.user.id,
    });

    if (!product) {
      return res.status(403).json({ error: "Not authorized" });
    }

    if (req.body.name !== undefined) product.name = req.body.name;

    if (req.body.price !== undefined) product.price = Number(req.body.price);

    if (req.body.stock !== undefined) product.stock = Number(req.body.stock);

    if (req.body.category !== undefined) product.category = req.body.category;

    if (req.body.description) {
      product.description = sanitizeHTML(req.body.description, {
        allowedTags: [
          "p",
          "b",
          "i",
          "em",
          "strong",
          "ul",
          "ol",
          "li",
          "br",
          "h1",
          "h2",
          "h3",
        ],
        allowedAttributes: {},
      });
    }

    if (req.file) {
      product.imageUrl = `/uploads/${req.file.filename}`;
    }

    await product.save();
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const product = await products.findOneAndDelete({
      _id: req.params.id,
      seller: req.user.id, // 🔐 ownership enforced
    });

    if (!product) {
      return res.status(403).json({ error: "Not authorized" });
    }

    res.json({ message: "Product deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getProductsByCategory = async (req, res) => {
  try {
    const categoryId = req.params.categoryId;
    if (!categoryId) {
      return res.status(400).json({ message: "Category ID is required" });
    }

    const product = await products.find({ category: categoryId });
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

module.exports = {
  addProducts,
  getProducts,
  getProduct,
  updateProduct,
  deleteProduct,
  getProductsByCategory,
};
