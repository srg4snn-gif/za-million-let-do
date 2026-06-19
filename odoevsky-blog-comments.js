(() => {
  const SUPABASE_URL = 'https://jlkqomamjnwgxcapkvnn.supabase.co';
  const SUPABASE_ANON_KEY = 'sb_publishable_8XPOAtjGTKY0k-BprVux9g_wua4mwlE';
  const root = document.querySelector('[data-blog-comments]');

  if (!root || !window.supabase) {
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
  const pagePath = root.getAttribute('data-comment-scope');
  const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  let replyParentId = null;

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

  function normalizedId(value) {
    return value === null || value === undefined ? null : String(value);
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
      const id = normalizedId(comment.id);
      byId.set(id, Object.assign({}, comment, {
        id,
        parent_id: normalizedId(comment.parent_id),
        replies: []
      }));
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
      comment.replies.forEach((reply) => replies.appendChild(createCommentItem(reply)));
      item.appendChild(replies);
    }

    return item;
  }

  function renderComments(comments) {
    commentsList.innerHTML = '';

    if (comments.length === 0) {
      const empty = document.createElement('p');
      empty.className = 'comment-note';
      appendText(empty, 'Пока комментариев нет.');
      commentsList.appendChild(empty);
      return;
    }

    const groups = new Map();
    buildCommentTree(comments).forEach((comment) => {
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
      groupComments.forEach((comment) => list.appendChild(createCommentItem(comment)));
      group.appendChild(list);
      commentsList.appendChild(group);
    });
  }

  async function loadComments() {
    const { data, error } = await supabaseClient
      .from('comments')
      .select('id,parent_id,username,comment,created_at,page_path')
      .eq('approved', true)
      .eq('page_path', pagePath)
      .order('created_at', { ascending: false });

    if (error) {
      commentsList.innerHTML = '';
      const message = document.createElement('p');
      message.className = 'comment-note';
      appendText(message, 'Не удалось загрузить комментарии. Попробуйте обновить страницу позже.');
      commentsList.appendChild(message);
      return;
    }

    renderComments(data || []);
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const username = usernameInput.value.trim();
    const email = emailInput.value.trim();
    const comment = textInput.value.trim();

    if (!username || !email || !comment) {
      return;
    }

    status.textContent = 'Отправляем комментарий...';
    const { error } = await supabaseClient.from('comments').insert({
      username,
      email,
      comment,
      parent_id: replyParentId,
      page_path: pagePath,
      created_at: new Date().toISOString(),
      approved: false
    });

    if (error) {
      status.textContent = 'Не удалось отправить комментарий. Попробуйте ещё раз.';
      return;
    }

    form.reset();
    resetReplyMode();
    usernameInput.focus();
    status.textContent = 'Комментарий отправлен и появится после проверки.';
  });

  replyCancel.addEventListener('click', resetReplyMode);
  loadComments();
})();
