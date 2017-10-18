(function() {
  class JSOscillator extends HTMLElement {
    constructor() {
      super();
    }

    connectedCallback() {
      this._root = this.attachShadow({mode: 'open'});
      this._audioContext = AudioContext && new AudioContext();
      this._osc = this._audioContext.createOscillator();
      this._minFreq = Number(this.getAttribute('min') || -5000);
      this._maxFreq = Number(this.getAttribute('max') || 5000);
      this._startFreq = Number(this.getAttribute('start') || 440);
      this._waveType = this.getAttribute('type') || 'sine';
      if (this._startFreq < this._minFreq || this._startFreq > this._maxFreq) {
        this._startFreq = this._minFreq;
      }
      this._osc.type = this._waveType;
      this._osc.start(0);
      this._osc.detune.value = this._startFreq;
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
      const waveTypes = ['Sine', 'Square', 'Sawtooth', 'Triangle'];
      const _template =
        `<section>
          <input type="number" id="numFreq" min="${this._minFreq}" max="${this._maxFreq}" value="${this._startFreq}">
          <button id="btnSetFreq">Set</button>
        </section>
        <section>
          <input type="range" id="rngFreq" min="${this._minFreq}" max="${this._maxFreq}" value="${this._startFreq}">
        </section>
        <section>
          ${waveTypes.map(w => '<button id="btn' + w + '"' + (w.toLowerCase() === this._waveType ? ' disabled' : null) + '>' + w + '</button>').join('')}
        </section>
        <section id="buttons">
          <button id="btnStart">Start</button>
          <button id="btnStop">Stop</button>
        </section>`;

      this._root.innerHTML = _styles + _template;
      this._typeButtons = waveTypes.map(w => this._root.querySelector('#btn' + w));

      const numFreq = this._root.querySelector('#numFreq');
      const rngFreq = this._root.querySelector('#rngFreq');

      let id;
      this.addEventListener('click', e => {
        id = e.path[0].id;
        switch (id) {
        case 'btnSetFreq':
          this._osc.detune.value = +numFreq.value;
          rngFreq.value = +numFreq.value;
          break;
        case 'btnSine':
        case 'btnSquare':
        case 'btnSawtooth':
        case 'btnTriangle':
          this._selectWaveType(id.split('btn')[1]);
          break;
        case 'btnStart':
          this._osc.connect(this._audioContext.destination);
          break;
        case 'btnStop':
          this._osc.disconnect();
          break;
        default:
          // Do nothing
        }
      });

      rngFreq.addEventListener('input', e => {
        this._osc.detune.value = rngFreq.value;
        numFreq.value = rngFreq.value;
      });
    }

    _selectWaveType(type) {
      this._osc.type = type.toLowerCase();
      this._typeButtons.map(b => {
        b.disabled = b.id === 'btn' + type;
      });
    }
  }

  customElements.define('js-oscillator', JSOscillator);
}());
