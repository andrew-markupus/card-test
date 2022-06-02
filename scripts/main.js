class CardApp {
  constructor() {
    this.API_URL = 'https://dev.michaljelen.com/mock-card-reader/api/';
    this.endpoints = {
      read: 'read',
      write: 'write',
    };
    this.screens = {
      start: document.querySelector('.screen--start'),
      progress: document.querySelector('.screen--progress'),
    };
    this.buttons = {
      write: document.querySelector('.process-write-card'),
      abort: document.querySelector('.process-abort'),
    };
    this.status = document.querySelector('.status');

    this.pollDelay = (ms = 500) => new Promise((resolve) => setTimeout(resolve, ms));
  }

  showScreen(screen) {
    const self = this;
    Object.keys(this.screens).forEach((elm) => {
      self.screens[elm].classList.remove('is-active');
    });
    screen.classList.add('is-active');
  }

  changeStatusText(text) {
    this.status.textContent = text;
  }

  readCard() {
    const self = this;

    self.showScreen(self.screens.progress);
    self.changeStatusText('Please insert a card');

    async function read() {
      while (!self.fetchCardSuccess && !self.abortStatus) {
        await self.pollDelay();

        const response = await fetch(self.API_URL + self.endpoints.read, {
            signal: self.abortController.signal
        });

        const result = await response.json();

        if (result.status === 'ok') {
          self.fetchCardSuccess = true;
          return result;
        }
      }
      return Promise.reject();
    }

    read().then((result) => {
      self.writeCard(result);
    }).catch((e) => {
      console.error(e);
    });
  }

  writeCard(data) {
    const self = this;
    self.changeStatusText('Writing');

    async function write() {

      await fetch(self.API_URL + self.endpoints.write, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        mode: 'no-cors',
        signal: self.abortController.signal,
        body: JSON.stringify({
          cardId: data.cardId,
          payload: 'Some data',
        }),
      });
      return Promise.resolve();
    }

    write().then(() => {
      self.changeStatusText('OK');
      setTimeout(() => {
        self.showScreen(self.screens.start);
      }, 500);
    }).catch((e) => {
      console.error(e);
    });
  }

  reset() {
    this.fetchCardSuccess = false;
    this.abortStatus = false;
    this.abortController = new AbortController();
  }

  abort() {
    this.abortController.abort();
    this.abortStatus = true;
    this.showScreen(this.screens.start);
  }

  init() {
    const self = this;

    this.showScreen(this.screens.start);

    this.buttons.write.addEventListener('click', () => {
      self.reset();
      self.readCard();
    });

    this.buttons.abort.addEventListener('click', () => {
      self.abort();
    });
  }
}

const cardApp = new CardApp();
cardApp.init();
