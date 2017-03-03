import Component, { fork } from '../../index';

export class SplitAssemblies extends Component {
  constructor() {
    super({
      description: 'Split production into concurrent lines',
      outPorts: ['b', 'c'],
      validates: { id: 'num' },
    });
  }
  handle(input, output) {
    const msg = input.getData('in');
    // We have to call error check and validation manually
    // if ports are different from IN -> [ ] -> OUT
    if (!this.validate(msg)) {
      return output.sendDone({
        b: msg,
        c: msg,
      });
    }
    // Fork the message to protect concurrency
    const forkedMsg = fork(msg);
    return output.sendDone({
      b: msg,
      c: forkedMsg,
    });
  }
}

export function getComponent() {
  return new SplitAssemblies();
}
