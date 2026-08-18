(() => {
  const SUPABASE_URL = 'https://jlkqomamjnwgxcapkvnn.supabase.co';
  const SUPABASE_ANON_KEY = 'sb_publishable_8XPOAtjGTKY0k-BprVux9g_wua4mwlE';
  const root = document.querySelector('[data-museum-comments]');

  if (!root) {
    return;
  }

  const form = root.querySelector('[data-comment-form]');
  const usernameInput = root.querySelector('[data-comment-username]');
  const emailInput = root.querySelector('[data-comment-email]');
  const textInput = root.querySelector('[data-comment-text]');
  const submitButton = form.querySelector('button[type="submit"]');
  const replyContext = root.querySelector('[data-reply-context]');
  const replyContextText = root.querySelector('[data-reply-context-text]');
  const replyCancel = root.querySelector('[data-reply-cancel]');
  const status = root.querySelector('[data-comment-status]');
  const commentsList = root.querySelector('[data-comments-list]');
  const pagePath = root.getAttribute('data-comment-scope') || window.location.pathname;
  let replyParentId = null;
  let canUsePagePath = true;

  const supabaseConfigured = !SUPABASE_URL.includes('YOUR_') && !SUPABASE_ANON_KEY.includes('YOUR_');
  const supabaseClient = supabaseConfigured
    ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    : null;
  const dateFormatter = new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });
  const timeFormatter = new Intl.DateTimeFormat('ru-RU', {
    hour: '2-digit',
    minute: '2-digit'
  });

  function appendText(parent, text) {
    parent.appendChild(document.createTextNode(text));
  }

  function resetReplyMode() {
    replyParentId = null;
    replyContext.classList.add('is-hidden');
    replyContextText.textContent = '';
    submitButton.textContent = 'Отправить комментарий';
  }

  function startReply(comment) {
    replyParentId = comment.id;
    replyContextText.textContent = 'Ответ на комментарий ' + comment.username;
    replyContext.classList.remove('is-hidden');
    submitButton.textContent = 'Отправить ответ';
    textInput.focus();
  }

  function buildCommentTree(comments) {
    const byId = new Map();
    const roots = [];

    comments.forEach((comment) => {
      byId.set(comment.id, Object.assign({}, comment, { replies: [] }));
    });

    byId.forEach((comment) => {
      if (comment.parent_id && byId.has(comment.parent_id)) {
        byId.get(comment.parent_id).replies.push(comment);
      } else {
        roots.push(comment);
      }
    });

    byId.forEach((comment) => {
      comment.replies.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    });
    roots.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    return roots;
  }

  function createCommentItem(comment) {
    const item = document.createElement('li');
    item.className = 'comment-item';

    const meta = document.createElement('p');
    meta.className = 'comment-meta';

    const author = document.createElement('span');
    author.className = 'comment-author';
    appendText(author, comment.username);
    meta.appendChild(author);
    appendText(meta, ' · ' + timeFormatter.format(new Date(comment.created_at)));

    const text = document.createElement('p');
    text.className = 'comment-text';
    appendText(text, comment.comment);

    const replyButton = document.createElement('button');
    replyButton.className = 'comment-reply-button';
    replyButton.type = 'button';
    appendText(replyButton, 'Ответить');
    replyButton.addEventListener('click', () => startReply(comment));

    item.appendChild(meta);
    item.appendChild(text);
    item.appendChild(replyButton);

    if (comment.replies.length > 0) {
      const replies = document.createElement('ul');
      replies.className = 'comment-replies';
      comment.replies.forEach((reply) => {
        replies.appendChild(createCommentItem(reply));
      });
      item.appendChild(replies);
    }

    return item;
  }

  function renderComments(comments) {
    commentsList.innerHTML = '';

    if (comments.length === 0) {
      const empty = document.createElement('p');
      empty.className = 'comment-note';
      appendText(empty, 'Пока записей обсуждения нет.');
      commentsList.appendChild(empty);
      return;
    }

    const tree = buildCommentTree(comments);
    const groups = new Map();
    tree.forEach((comment) => {
      const date = dateFormatter.format(new Date(comment.created_at));
      if (!groups.has(date)) {
        groups.set(date, []);
      }
      groups.get(date).push(comment);
    });

    groups.forEach((groupComments, date) => {
      const group = document.createElement('div');
      group.className = 'comment-date-group';

      const heading = document.createElement('h4');
      heading.className = 'comment-date';
      appendText(heading, date);
      group.appendChild(heading);

      const list = document.createElement('ul');
      list.className = 'comment-list';

      groupComments.forEach((comment) => {
        list.appendChild(createCommentItem(comment));
      });

      group.appendChild(list);
      commentsList.appendChild(group);
    });
  }

  function isMissingPagePath(error) {
    return error && typeof error.message === 'string' && error.message.includes('page_path');
  }

  async function loadComments() {
    if (!supabaseClient) {
      commentsList.innerHTML = '';
      const message = document.createElement('p');
      message.className = 'comment-note';
      appendText(message, 'Supabase не настроен: добавьте URL проекта и anon key в код страницы.');
      commentsList.appendChild(message);
      return;
    }

    let query = supabaseClient
      .from('comments')
      .select('id,parent_id,username,comment,created_at,page_path')
      .eq('approved', true)
      .order('created_at', { ascending: false });

    if (canUsePagePath) {
      query = query.eq('page_path', pagePath);
    }

    let { data, error } = await query;

    if (isMissingPagePath(error)) {
      canUsePagePath = false;
      const fallback = await supabaseClient
        .from('comments')
        .select('id,parent_id,username,comment,created_at')
        .eq('approved', true)
        .order('created_at', { ascending: false });
      data = fallback.data;
      error = fallback.error;
    }

    if (error) {
      commentsList.innerHTML = '';
      const message = document.createElement('p');
      message.className = 'comment-note';
      appendText(message, 'Не удалось загрузить обсуждение. Попробуйте обновить страницу позже.');
      commentsList.appendChild(message);
      return;
    }

    renderComments(data || []);
  }

  async function submitComment(payload) {
    const { error } = await supabaseClient.from('comments').insert(payload);

    if (isMissingPagePath(error)) {
      canUsePagePath = false;
      const fallbackPayload = Object.assign({}, payload);
      delete fallbackPayload.page_path;
      return supabaseClient.from('comments').insert(fallbackPayload);
    }

    return { error };
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    if (!supabaseClient) {
      status.textContent = 'Supabase не настроен: добавьте URL проекта и anon key.';
      return;
    }

    const username = usernameInput.value.trim();
    const email = emailInput.value.trim();
    const text = textInput.value.trim();

    if (!username || !email || !text) {
      return;
    }

    status.textContent = 'Отправляем запись...';

    const { error } = await submitComment({
      username,
      email,
      comment: text,
      parent_id: replyParentId,
      page_path: pagePath,
      created_at: new Date().toISOString(),
      approved: false
    });

    if (error) {
      status.textContent = 'Не удалось отправить запись. Попробуйте ещё раз.';
      return;
    }

    form.reset();
    resetReplyMode();
    usernameInput.focus();
    status.textContent = 'Запись отправлена и появится после проверки.';
  });

  replyCancel.addEventListener('click', resetReplyMode);
  loadComments();
})();
