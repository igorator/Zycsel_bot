const { COUNT_REMOVE_REGEX } = require('../../constants/regex');

const handlerCountRemove = (command) => {
  return command.replace(COUNT_REMOVE_REGEX, '');
};

module.exports = { handlerCountRemove };
