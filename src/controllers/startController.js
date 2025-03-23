const { SCREENS } = require('../constants/screens');
const { getChannelPostsTypes } = require('../model');
const { SCREEN_FACTORY } = require('../view/screens');

const setupStartController = async (bot) => {
  bot.command('start', async (ctx) => {
    const types = await getChannelPostsTypes();

    ctx.session.screen = SCREENS.typeSelection;
    await ctx.reply(
      'Привіт, на звʼязку бот Zycsel_store🦖 Тут ви можете переглянути всю наявність по брендам/розмірам тощо.',
      { reply_to_message_id: ctx.msg.message_id },
    );
    const renderControls = SCREEN_FACTORY[SCREENS.typeSelection];
    renderControls(ctx, types);
  });
};

module.exports = { setupStartController };
