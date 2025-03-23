const { COUNT_REMOVE_REGEX } = require('../../constants/regex');

const buttonCountRemove = (command) => {
  return command.replace(COUNT_REMOVE_REGEX, '');
};

module.exports = { buttonCountRemove };
