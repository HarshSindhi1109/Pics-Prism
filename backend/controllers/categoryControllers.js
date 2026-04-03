const Category = require("../models/categoryModel");

const addCategory = async (req, res) => {
  try {
    console.log("Request Body:", req.body); 
    if (!req.file) {
      return res.status(400).json({ message: "Image is required" });
    }

    const category = new Category({
      name: req.body.name,
      imageUrl: `/uploads/${req.file.filename}`, // Save the uploaded file path
      discount: req.body.discount || "", // Optional field
    });

    await category.save();
    res.status(201).json(category);
  } catch (error) {
    console.error("Error adding category:", error.message);
    res.status(500).json({ message: error.message });
  }
};


const getCategories = async (req, res) => {
  try {
    const category = await Category.find({});
    return res.status(201).json(category);
  } catch (error) {
    return res.status(500).json({ message: error });
  }
};

const getCategory = async (req, res) => {
  try {
    const categoryID = req.params.id;
    const category = await Category.findOne({ _id: categoryID });
    if (!category) {
      return res
        .status(404)
        .json({ msg: `No Data found with id: {categoryID}` });
    }
    return res.status(200).json(category);
  } catch (error) {
    return res.status(500).json({ msg: error });
  }
};

const updateCategory = async (req, res) => {
  try {
    const categoryID = req.params.id;
    
    let updateData = { ...req.body };
    if (req.file) {
      updateData.imageUrl = `/uploads/${req.file.filename}`;
    }

    const updatedCategory = await Category.findOneAndUpdate(
      { _id: categoryID },
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedCategory) {
      return res.status(404).json({ msg: `No category found with id: ${categoryID}` });
    }

    return res.status(200).json(updatedCategory);
  } catch (error) {
    return res.status(500).json({ msg: error.message });
  }
};


const deleteCategory = async (req, res) => {
  try {
    const categoryID = req.params.id;
    const category = await Category.findOneAndDelete({ _id: categoryID });
    if (!category) {
      return res
        .status(404)
        .json({ msg: `No Data found with id: {categoryID}` });
    }
    return res.status(200).json(category);
  } catch (error) {
    return res.status(500).json({ msg: error });
  }
};

module.exports = {
  addCategory,
  getCategory,
  updateCategory,
  getCategories,
  deleteCategory
};
