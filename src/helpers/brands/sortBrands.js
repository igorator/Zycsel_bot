const sortBrands = (brands) => {
  return brands.sort((a, b) => {
    const brandA = a.split(' (')[0];
    const brandB = b.split(' (')[0];

    if (brandA === 'Stone Island') return -1;
    if (brandB === 'Stone Island') return 1;
    if (brandA === 'Cp Company') return -1;
    if (brandB === 'Cp Company') return 1;

    return brandA.localeCompare(brandB);
  });
};

module.exports = { sortBrands };
