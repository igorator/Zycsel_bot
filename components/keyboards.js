const { Keyboard } = require('grammy');

const qualityKeyboard = new Keyboard()
  .text('Нові')
  .row()
  .resized()
  .text('Вживані')
  .row()
  .resized()
  .text('Назад')
  .row()
  .resized()
  .placeholder('Оберіть стан речей');

const typeKeyboard = new Keyboard()
  .text('Одяг')
  .row()
  .resized()
  .text('Взуття')
  .row()
  .text('Аксесуари')
  .row()
  .resized()
  .placeholder('Оберіть тип речей');

const sizesKeyboard = (sizesLabels) => {
  const sizesButtons = sizesLabels.map((label) => {
    return [Keyboard.text(label)];
  });

  sizesButtons.unshift([Keyboard.text('Назад')]);

  const sizeKeyboard = Keyboard.from(sizesButtons)
    .resized()
    .placeholder('Оберіть розмір речей');

  return sizeKeyboard;
};

const brandKeyboard = (brands) => {
  const brandButtons = brands.map((label) => {
    return [Keyboard.text(label)];
  });

  brandButtons.unshift([Keyboard.text('Назад')], [Keyboard.text('Всі бренди')]);

  const brandsKeyboard = Keyboard.from(brandButtons)
    .resized()
    .placeholder('Оберіть бренд')
    .oneTime();

  return brandsKeyboard;
};

const itemsSearchKeyboard = new Keyboard()
  .text('Завантажити ще')
  .row()
  .text('Знайти інші речі')
  .row()
  .oneTime();

const searchRefreshKeyboard = new Keyboard().text('Знайти інші речі');

module.exports = {
  qualityKeyboard,
  typeKeyboard,
  sizesKeyboard,
  brandKeyboard,
  itemsSearchKeyboard,
  searchRefreshKeyboard,
};
