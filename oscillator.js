(function() {
  const waveTypes = ['Sine', 'Square', 'Sawtooth', 'Triangle'];

  class JSOscillator extends HTMLElement {
    constructor() {
      super();
    }

    connectedCallback() {
      this._root = this.attachShadow({mode: 'open'});
      this._audioContext = AudioContext && new AudioContext();
      this._osc = this._audioContext.createOscillator();
      this._minFreq = Number(this.getAttribute('min')) || -5000;
      this._maxFreq = Number(this.getAttribute('max')) || 5000;
      const _styles =
        `<style>
          :host {
            background-color: #efefef;
            border: 1px solid #000;
            box-sizing: border-box;
            display: block;
            font-size: 8pt;
            padding: 10px;
            text-align: center;
            width: 250px;
          }
          section {
            display: flex;
            text-align: left;
            width: 100%;
          }
          input {
            flex: 1;
          }
          #buttons button {
            width: 50%;
          }
        </style>`;
      const _template =
        `<section>
          <input type="number" id="numFreq" min="${this._minFreq}" max="${this._maxFreq}" value="${this.frequency}">
          <button id="btnSetFreq">Set</button>
        </section>
        <section>
          <input type="range" id="rngFreq" min="${this._minFreq}" max="${this._maxFreq}" value="${this.frequency}">
        </section>
        <section>
          ${waveTypes.map(w => '<button id="btn' + w + '">' + w + '</button>').join('')}
        </section>
        <section id="buttons">
          <button id="btnStart">Start</button>
          <button id="btnStop">Stop</button>
        </section>`;

      this._root.innerHTML = _styles + _template;
      this._numFreq = this._root.querySelector('#numFreq');
      this._rngFreq = this._root.querySelector('#rngFreq');
      this.frequency = Number(this.getAttribute('start')) || 440;
      if (this.frequency < this._minFreq || this.frequency > this._maxFreq) {
        this.frequency = this._minFreq;
      }
      this.type = this.getAttribute('type') || 'sine';
      this._osc.start(0);

      let id;
      this.addEventListener('click', e => {
        id = e.path[0].id;
        switch (id) {
        case 'btnSetFreq':
          this.frequency = +this._numFreq.value;
          break;
        case 'btnSine':
        case 'btnSquare':
        case 'btnSawtooth':
        case 'btnTriangle':
          this.type = id.split('btn')[1];
          break;
        case 'btnStart':
          this.play();
          break;
        case 'btnStop':
          this.stop();
          break;
        default:
          // Do nothing
        }
      });

      this._rngFreq.addEventListener('input', e => {
        this.frequency = this._rngFreq.value;
      });
    }

    get frequency () {
      return this._osc.detune.value;
    }

    set frequency (freq) {
      this._osc.detune.value = freq;
      this._numFreq.value = freq;
      this._rngFreq.value = freq;
    }

    get type () {
      return this._osc.type;
    }

    set type (type) {
      const waveType = type.toLowerCase();
      if (typeof this._typeButtons === 'undefined') {
        this._typeButtons = waveTypes.map(w => this._root.querySelector('#btn' + w));
      }
      this._osc.type = waveType;
      this._typeButtons.map(b => {
        b.disabled = b.id.toLowerCase() === 'btn' + waveType;
      });
    }

    play() {
      this._osc.connect(this._audioContext.destination);
    }

    stop() {
      this._osc.disconnect();
    }
  }

  customElements.define('js-oscillator', JSOscillator);
}());
