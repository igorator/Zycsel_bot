const filterCountSizes = (sizes, order) => {
  const countMap = order.reduce((acc, size) => {
    acc[size] = 0;
    return acc;
  }, {});

  sizes.forEach((sizeString) => {
    sizeString
      .split(',')
      .map((size) => size.trim())
      .forEach((size) => {
        if (countMap[size] !== undefined) {
          countMap[size] += 1;
        }
      });
  });

  return order
    .map((size) => {
      const count = countMap[size];
      if (count > 0) {
        return `${size} (${count})`;
      }
      return null;
    })
    .filter(Boolean);
};

module.exports = { filterCountSizes };
