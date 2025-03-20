const { SCREENS } = require('../constants/screens');
const { SCREEN_FACTORY } = require('../services/render/renderCotrols');

const setupStartHandler = (bot) => {
  bot.command('start', async (ctx) => {
    ctx.session.screen = SCREENS.typeSelection;
    await ctx.reply(
      'Привіт, на звʼязку бот Zycsel_store🦖 Тут ви можете переглянути всю наявність по брендам/розмірам тощо.',
      { reply_to_message_id: ctx.msg.message_id },
    );
    const renderControls = SCREEN_FACTORY[SCREENS.typeSelection];
    renderControls(ctx);
  });
};

module.exports = { setupStartHandler };
