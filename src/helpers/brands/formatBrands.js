const formatBrands = (brands) =>
  brands.map((item) => item.brand).filter(Boolean);

module.exports = { formatBrands };
