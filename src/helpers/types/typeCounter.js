const typeCounter = (types, ITEMS) => {
  const typeCounts = types.reduce((acc, type) => {
    const item = Object.values(ITEMS).find((item) => item.name === type);

    if (item) {
      acc[type] = (acc[type] || 0) + 1;
    }

    return acc;
  }, {});

  return typeCounts;
};

module.exports = { typeCounter };
