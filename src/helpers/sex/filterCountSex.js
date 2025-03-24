const { SEX_TYPES } = require('../../constants/sexTypes');

const filterCountSex = (sex) =>
  sex.reduce(
    (acc, item) => {
      const sex = item.sex?.toLowerCase();
      if (sex === SEX_TYPES.man) {
        acc.man++;
      } else if (sex === SEX_TYPES.woman) {
        acc.woman++;
      } else if (sex === SEX_TYPES.unisex) {
        acc.unisex++;
      }
      return acc;
    },
    { man: 0, woman: 0, unisex: 0 },
  );

module.exports = { filterCountSex };
