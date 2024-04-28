const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Получает сообщения из канала.
 * @param {number} from - Начальный индекс сообщений для выборки.
 * @param {number} to - Конечный индекс сообщений для выборки.
 * @param {boolean} isNew - Параметр, указывающий на новые сообщения.
 * @param {string} type - Тип сообщений для фильтрации.
 * @param {string[]} sizes - Размеры сообщений для фильтрации.
 * @param {string} brand - Бренд сообщений для фильтрации.
 * @returns {Promise<Object[]>} - Массив объектов с данными сообщений.
 */
const getChannelPosts = async (
  from = 0,
  to = 10,
  isNew,
  type,
  sizes,
  brand,
) => {
  const { data, error } = await supabase
    .from('Zycsel-channel-posts-table')
    .select('*')
    .range(from, to);

  return data;
};

// Экспорт функции
module.exports = { getChannelPosts };
