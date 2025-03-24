const filterCountQualities = (qualities) =>
  qualities.reduce(
    (acc, item) => {
      if (item['is-new']) {
        acc.new++;
      } else {
        acc.used++;
      }
      return acc;
    },
    { new: 0, used: 0 },
  );

module.exports = { filterCountQualities };
