function getCategoryIdByName(categories, name) {
  const parallelCategory = categories.find(category => {
    return category.name === name;
  });
  
  return parallelCategory.id;
}
  
module.exports = {
  getCategoryIdByName: getCategoryIdByName
};