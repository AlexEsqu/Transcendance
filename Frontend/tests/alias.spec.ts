// import welcomeHtml from '../src/pages/welcome.html';

// describe('html import', () => {
//   it('loads welcome.html', () => {
//     expect(typeof welcomeHtml).toBe('string');
//     expect(welcomeHtml.length).toBeGreaterThan(0);
//   });
// });

import welcomeHtml from '../src/pages/welcome.html';
import guestinHtml from '../src/pages/guestin.html';
import registerHtml from '../src/pages/register.html';
import loginHtml from '../src/pages/login.html';
import settingHtml from '../src/pages/setting.html';

import {
  displayAliasQueryPage,
  displayGuestInPage,
  displayRegisterPage,
  displayLoginPage,
  displayUserSettingPage,
  displayGamePage,
} from '../src/landing/alias';

describe('Alias flow pages', () => {
  let pushStateSpy: jasmine.Spy;

  beforeEach(() => {
    // Clean DOM and storage before each test
    document.body.innerHTML = '';
    localStorage.clear();

    // Spy history navigation
    pushStateSpy = spyOn(window.history, 'pushState');

    // Stub fetch to avoid network
    spyOn(window, 'fetch').and.resolveTo(
      new Response(JSON.stringify({ ok: true }), { status: 200 })
    );

    // Stub alert to avoid UI interruptions
    spyOn(window, 'alert').and.stub();
  });

  describe('displayAliasQueryPage', () => {
    it('renders the welcome layout and wires the navigation buttons', () => {
      // Inject template then run page logic
      document.body.insertAdjacentHTML('afterbegin', welcomeHtml);
      displayAliasQueryPage();

      const btnGuest = document.getElementById('btn-guestin');
      const btnLogin = document.getElementById('btn-login');
      const btnRegister = document.getElementById('btn-register');

      expect(btnGuest).withContext('Guest button missing').toBeTruthy();
      expect(btnLogin).withContext('Login button missing').toBeTruthy();
      expect(btnRegister).withContext('Register button missing').toBeTruthy();

      // click guest
      btnGuest!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      expect(pushStateSpy).toHaveBeenCalledWith({ page: 'loginAsGuest' }, '', '#loginAsGuest');

      // click login
      btnLogin!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      expect(pushStateSpy).toHaveBeenCalledWith({ page: 'login' }, '', '#login');

      // click register
      btnRegister!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      expect(pushStateSpy).toHaveBeenCalledWith({ page: 'register' }, '', '#register');
    });
  });

  describe('displayGuestInPage', () => {
    it('accepts alias and navigates to game, resets the input', () => {
      document.body.insertAdjacentHTML('afterbegin', guestinHtml);
      displayGuestInPage();

      const input = document.getElementById('input-alias') as HTMLInputElement;
      const btnSubmit = document.getElementById('btn-submit-alias') as HTMLButtonElement;

      expect(input).toBeTruthy();
      expect(btnSubmit).toBeTruthy();

      input.value = 'Alice';
      btnSubmit.click();

      expect(localStorage.getItem('PongAlias')).toBe('Alice');
      expect(pushStateSpy).toHaveBeenCalledWith({ page: 'game' }, '', '#game');
      expect(input.value).toBe('', 'Input should reset after submit');
    });

    it('does nothing on empty alias', () => {
      document.body.insertAdjacentHTML('afterbegin', guestinHtml);
      displayGuestInPage();

      const input = document.getElementById('input-alias') as HTMLInputElement;
      const btnSubmit = document.getElementById('btn-submit-alias') as HTMLButtonElement;

      input.value = '';
      btnSubmit.click();

      expect(localStorage.getItem('PongAlias')).toBeNull();
      expect(pushStateSpy).not.toHaveBeenCalled();
    });
  });

  describe('displayRegisterPage', () => {
    it('validates password confirmation and calls backend signup', async () => {
      document.body.insertAdjacentHTML('afterbegin', registerHtml);
      displayRegisterPage();

      const login = document.getElementById('input-login') as HTMLInputElement;
      const pass = document.getElementById('input-password') as HTMLInputElement;
      const passCheck = document.getElementById('input-password-check') as HTMLInputElement;
      const btnRegister = document.getElementById('btn-submit-register') as HTMLButtonElement;

      expect(login && pass && passCheck && btnRegister).toBeTruthy();

      // Valid input
      login.value = 'bob';
      pass.value = 'secret';
      passCheck.value = 'secret';
      btnRegister.click();

      // Wait for microtask queue (async handler)
      await Promise.resolve();

      expect(fetch).toHaveBeenCalledWith(
        jasmine.stringMatching(/users\/signup/i),
        jasmine.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: 'bob', password: 'secret' }),
        })
      );
    });

    it('alerts on password mismatch and does not call backend', async () => {
      document.body.insertAdjacentHTML('afterbegin', registerHtml);
      displayRegisterPage();

      const login = document.getElementById('input-login') as HTMLInputElement;
      const pass = document.getElementById('input-password') as HTMLInputElement;
      const passCheck = document.getElementById('input-password-check') as HTMLInputElement;
      const btnRegister = document.getElementById('btn-submit-register') as HTMLButtonElement;

      login.value = 'bob';
      pass.value = 'secret';
      passCheck.value = 'notsecret';
      btnRegister.click();

      await Promise.resolve();

      expect(window.alert).toHaveBeenCalled();
      expect(fetch).not.toHaveBeenCalled();
    });
  });

  describe('displayLoginPage', () => {
    it('submits credentials and navigates to game on success', async () => {
      document.body.insertAdjacentHTML('afterbegin', loginHtml);
      displayLoginPage();

      const login = document.getElementById('input-login') as HTMLInputElement;
      const pass = document.getElementById('input-password') as HTMLInputElement;
      const btnLogin = document.getElementById('btn-submit-login') as HTMLButtonElement;

      expect(login && pass && btnLogin).toBeTruthy();

      login.value = 'charlie';
      pass.value = 'hunter2';
      btnLogin.click();

      await Promise.resolve();

      // If your login page calls backend:
      expect(fetch).toHaveBeenCalledWith(
        jasmine.stringMatching(/auth\/login/i),
        jasmine.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: 'charlie', password: 'hunter2' }),
        })
      );

      // If the page uses history to navigate after success:
      // We can't assert exact state unless alias.ts sets it, but commonly:
      expect(pushStateSpy).toHaveBeenCalledWith({ page: 'game' }, '', '#game');
    });

    it('alerts on invalid credentials (backend 401)', async () => {
      (fetch as jasmine.Spy).and.resolveTo(new Response('Unauthorized', { status: 401 }));
      document.body.insertAdjacentHTML('afterbegin', loginHtml);
      displayLoginPage();

      const login = document.getElementById('input-login') as HTMLInputElement;
      const pass = document.getElementById('input-password') as HTMLInputElement;
      const btnLogin = document.getElementById('btn-submit-login') as HTMLButtonElement;

      login.value = 'charlie';
      pass.value = 'wrong';
      btnLogin.click();

      await Promise.resolve();

      expect(window.alert).toHaveBeenCalled();
      expect(pushStateSpy).not.toHaveBeenCalled();
    });
  });

  describe('displayUserSettingPage', () => {
    it('wires avatar save, rename, and password change', async () => {
      document.body.insertAdjacentHTML('afterbegin', settingHtml);
      await displayUserSettingPage();

      const avatarInput = document.getElementById('input-avatar') as HTMLInputElement;
      const avatarBtn = document.getElementById('btn-submit-avatar') as HTMLButtonElement;

      const renameInput = document.getElementById('input-rename-user') as HTMLInputElement;
      const renameBtn = document.getElementById('btn-submit-rename-user') as HTMLButtonElement;

      const oldPass = document.getElementById('input-old-password') as HTMLInputElement;
      const newPass = document.getElementById('input-password') as HTMLInputElement;
      const checkPass = document.getElementById('input-password-check') as HTMLInputElement;
      const changeBtn = document.getElementById('btn-submit-password') as HTMLButtonElement;

      expect(avatarInput && avatarBtn && renameInput && renameBtn && oldPass && newPass && checkPass && changeBtn).toBeTruthy();

      // If your code calls backend for avatar:
      avatarInput.value = '/avatar.png';
      avatarBtn.click();
      await Promise.resolve();
      expect(fetch).toHaveBeenCalledWith(
        jasmine.stringMatching(/users\/avatar|patchUserAvatar/i),
        jasmine.any(Object)
      );
      expect(avatarInput.value).toBe('');

      // Rename
      renameInput.value = 'NewName';
      renameBtn.click();
      await Promise.resolve();
      expect(fetch).toHaveBeenCalledWith(
        jasmine.stringMatching(/users\/rename|patchUserName/i),
        jasmine.any(Object)
      );
      expect(renameInput.value).toBe('');

      // Change password
      oldPass.value = 'old';
      newPass.value = 'new';
      checkPass.value = 'new';
      changeBtn.click();
      await Promise.resolve();
      expect(fetch).toHaveBeenCalledWith(
        jasmine.stringMatching(/users\/password|patchUserPassword/i),
        jasmine.any(Object)
      );
      expect(oldPass.value).toBe('');
      expect(newPass.value).toBe('');
      expect(checkPass.value).toBe('');
    });

    it('alerts when new passwords mismatch', async () => {
      document.body.insertAdjacentHTML('afterbegin', settingHtml);
      await displayUserSettingPage();

      const oldPass = document.getElementById('input-old-password') as HTMLInputElement;
      const newPass = document.getElementById('input-password') as HTMLInputElement;
      const checkPass = document.getElementById('input-password-check') as HTMLInputElement;
      const changeBtn = document.getElementById('btn-submit-password') as HTMLButtonElement;

      oldPass.value = 'old';
      newPass.value = 'one';
      checkPass.value = 'two';
      changeBtn.click();

      await Promise.resolve();

      expect(window.alert).toHaveBeenCalled();
      // backend should not be called
      expect(fetch).not.toHaveBeenCalledWith(jasmine.stringMatching(/users\/password|patchUserPassword/i), jasmine.anything());
    });
  });

  describe('displayGamePage integration (alias check)', () => {
    it('navigates to game when alias is set', () => {
      // Simulate alias present
      localStorage.setItem('PongAlias', 'Player1');

      // displayGamePage commonly clears body and renders game + header + footer
      displayGamePage();

      // Ensure main elements exist (IDs/classes depend on your impl)
      const gameMain = document.querySelector('main.game') || document.getElementById('game');
      expect(gameMain).toBeTruthy();
    });

    it('should not navigate if alias is missing (handled elsewhere)', () => {
      localStorage.removeItem('PongAlias');
      displayGamePage();
      // Depending on your implementation, it might display alias query page or remain
      // Here we only assert it didn’t push to game
      expect(pushStateSpy).not.toHaveBeenCalledWith({ page: 'game' }, '', '#game');
    });
  });
});
