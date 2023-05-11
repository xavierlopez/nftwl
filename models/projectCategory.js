const Joi = require('joi');
const mongoose = require('mongoose');

const projectCategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 50
  }
});

const ProjectCategory = mongoose.model('Categories', projectCategorySchema);

function validateProjectCategory(projectCategory) {
  const schema = {
    name: Joi.string().min(5).max(50).required()
  };

  return Joi.validate(projectCategory, schema);
}

exports.projectCategorySchema = projectCategorySchema;
exports.ProjectCategory = ProjectCategory; 
exports.validate = validateProjectCategory;