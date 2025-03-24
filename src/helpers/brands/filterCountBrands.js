const filterCountBrands = (brands) => {
  const brandCounts = brands.reduce((acc, brand) => {
    acc[brand] = (acc[brand] || 0) + 1;
    return acc;
  }, {});

  return Object.entries(brandCounts)
    .filter(([, count]) => count > 0)
    .map(([brand, count]) => `${brand} (${count})`);
};

module.exports = { filterCountBrands };
