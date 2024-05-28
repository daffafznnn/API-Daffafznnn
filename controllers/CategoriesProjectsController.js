import Categories_Project from "../models/Categories_projectsModel.js";

export const getCategories = async (req, res) => {
  try {
    const response = await Categories_Project.findAll();
    res.status(200).json({
      msg: "Successfully get all category data",
      data: response
    });
  } catch (error) {
    res.status(500).json({ msg: "Server error occurred" });
    console.log(error);
  }
};

export const addCategories = async (req, res) => {
  const { name } = req.body;
  try {
    if (!name) {
      return res.status(400).json({ msg: 'Category name field cannot be empty' });
    }
    const newCategory = await Categories_Project.create({
      name: name
    });
    res.status(201).json({ msg: `Successfully add a ${newCategory.name} category` });
  } catch (error) {
     res.status(500).json({ msg: "Server error occurred" });
     console.log(error);   
  }
};

export const updateCategories = async (req, res) => {
  const { name } = req.body;
  try {
    const category = await Categories_Project.findOne({
      where: {
        id: req.params.id
      }
    });

    if (!category) {
      return res.status(404).json({ msg: 'Category not found' });
    }

    const newCategory = await Categories_Project.update({
      name: name
    }, {
      where: {
        id: category.id
      }
    });
    res
      .status(200)
      .json({
        msg: `Category ${category.name} has been updated to ${newCategory.name}`,
      });
  } catch (error) {
     res.status(500).json({ msg: "Server error occurred" });
     console.log(error);       
  }
};

export const deleteCategories = async (req, res) => {
  try {
     const category = await Categories_Project.findOne({
       where: {
         id: req.params.id,
       },
     });
    
     if (!category) {
       return res.status(404).json({ msg: "Category not found" });
     }
    
    const newCategory = await Categories_Project.destroy({
      where: {
        id: category.id
       }
     });
     res.status(200).json({
       msg: `Category ${category.name} successfully deleted`,
     });
  } catch (error) {
     res.status(500).json({ msg: "Server error occurred" });
     console.log(error);      
  }
};