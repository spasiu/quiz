(() => {
  window.appToken = '1z8nldxof2a9i6vcdkjc0d7zu';
  window.problems = {
    init,
    createUser
  }

  function init(quiz, token) {
    const userInput = document.createElement('input');
    userInput.setAttribute('type', 'text');
    userInput.setAttribute('placeholder', 'user ID');
    userInput.setAttribute('id', 'user-id');
    document.body.insertBefore(userInput, document.body.firstChild);
    const h1 = document.createElement('h1');
    h1.innerText = quiz;
    document.body.insertBefore(h1, document.body.firstChild);
    const elements = document.getElementsByClassName('problem');
    let count = 1;
    for (const el of elements) {
      const wrapper = document.createElement('p');
      el.parentNode.replaceChild(wrapper, el);
      wrapper.appendChild(el);
      const title = `${count}. ${el.getAttribute('description')}`;
      const stored = window.localStorage.getItem(title);
      if (stored) {
        el.textContent = stored;
      }
      const description = document.createElement('h3');
      description.innerText = title;
      const editor = ace.edit(el);
      editor.session.setMode("ace/mode/javascript");
      editor.setTheme("ace/theme/monokai");
      const button = document.createElement('button');
      button.innerText = 'submit';
      const feedback = document.createElement('div');
      feedback.className = 'feedback';
      wrapper.appendChild(feedback);
      button.onclick = () => submit(title, editor.getValue(), err => {
        feedback.innerText = '';
        if (err) {
          feedback.innerText = `❌ ${err.message}`;
          return;
        }

        feedback.innerText = '✅ submitted';
        button.innerText = 'resubmit';
      });
      wrapper.insertBefore(button, el.nextSibling);
      wrapper.insertBefore(description, el);
      count = count + 1;
    }
  }

  function submit(title, code, cb) {
    window.localStorage.setItem(title, code);
    const userId = document.getElementById('user-id').value;
    if (!userId) {
      return alert('Provide a user ID');
    }

    superagent
      .post(`https://app.smooch.io/v1/appusers/${userId}/messages`)
      .set('content-type', 'application/json')
      .set('app-token', window.appToken)
      .send({
        role: 'appUser',
        text: `${title}:\n\`\`\`\n${code}\n\`\`\``
      })
      .end((err, res) => {
        if (err && err.message.indexOf('Not Found') !== -1) {
          return alert('User not found. Check your user ID');
        }

        if (err) {
          return cb(err);
        }

        cb(null);
      });
  }

  function createUser(userId, givenName, surname) {
    Smooch.init({
      appToken: window.appToken,
      userId,
      givenName,
      surname
    })
      .then((wat) => {
        console.log(wat, Smooch);
        Smooch.destroy();
      });
  }
})();
