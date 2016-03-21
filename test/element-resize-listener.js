/* global window */
import 'babel-polyfill';
import { addElementResizeListener, removeElementResizeListener } from '../src/element-resize-listener';
import chai from 'chai';
import chaiSpies from 'chai-spies';
chai.use(chaiSpies).should();

const globalObject = (typeof window === 'undefined') ? global : window;
// Just let mocha know that these globals are fine to ignore
if (globalObject.mocha && globalObject.mocha.globals) {
  globalObject.mocha.globals([ 'HTMLElement', 'addEventListener', 'removeEventListener' ]);
}

function delay(milliseconds = 150) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

describe('element-resize-listener', () => {
  let element = null;
  let callback = null;
  let resizeListener = null;
  beforeEach(() => {
    /* eslint-disable id-match */
    globalObject.HTMLElement = chai.spy();
    /* eslint-enable id-match */
    globalObject.addEventListener = chai.spy((event, eventCallback) => {
      resizeListener = eventCallback;
    });
    globalObject.removeEventListener = chai.spy();
    element = new globalObject.HTMLElement();
    callback = chai.spy();
  });

  describe('addElementResizeListener', () => {
    it('throws an error if given non HTMLElement instance', () => {
      addElementResizeListener.should.throw(Error, /element must be HTMLElement/);
    });

    it('throws an error if given non-function callback', () => {
      (() => addElementResizeListener(element)).should.throw(Error, /callback must be function/);
    });

    it('returns true to indicate successfully bound function', () => {
      addElementResizeListener(element, callback).should.equal(true, 'callback registered');
    });

    it('successive calls return false to indicate listener is already bound', () => {
      addElementResizeListener(element, callback).should.equal(true, 'first call registered');
      addElementResizeListener(element, callback).should.equal(false, 'second call not registered');
      addElementResizeListener(element, callback).should.equal(false, 'third call not registered');
      addElementResizeListener(element, callback).should.equal(false, 'fourth call not registered');
    });

    it('callback will be called with (width, height) when element resizes', () => {
      addElementResizeListener(element, callback);
      element.offsetWidth = 20;
      element.offsetHeight = 40;
      globalObject.addEventListener.should.have.been.called(1);
      return delay().then(() => {
        resizeListener();
        return delay();
      }).then(() => {
        callback.should.have.been.called(1).with.exactly(20, 40);
      });
    });

    it('callback will not be called until size changes', () => {
      addElementResizeListener(element, callback);
      element.offsetWidth = 20;
      element.offsetHeight = 40;
      globalObject.addEventListener.should.have.been.called(1);
      return delay().then(() => {
        resizeListener();
        return delay();
      }).then(() => {
        callback.should.have.been.called(1).with.exactly(20, 40);
        resizeListener();
        return delay();
      }).then(() => {
        callback.should.have.been.called(1).with.exactly(20, 40);
        element.offsetWidth = 30;
        resizeListener();
        return delay();
      }).then(() => {
        callback.should.have.been.called(2).with.exactly(30, 40);
      });
    });
  });

  describe('removeElementResizeListener', () => {
    it('returns false for elements which have never had bound listeners', () => {
      removeElementResizeListener({}, callback).should.equal(false);
    });

    it('returns false for callbacks which are not actually listening to the element', () => {
      removeElementResizeListener(element, callback).should.equal(false);
    });

    it('returns true if the listener was bound to the element', () => {
      addElementResizeListener(element, callback);
      removeElementResizeListener(element, callback).should.equal(true);
    });

    it('successfully unbinds the callback from the element resize', () => {
      addElementResizeListener(element, callback);
      removeElementResizeListener(element, callback).should.equal(true);
      globalObject.addEventListener.should.have.been.called(1);
      element.offsetWidth = 20;
      element.offsetHeight = 40;
      return delay().then(() => {
        resizeListener();
        return delay();
      }).then(() => {
        callback.should.not.have.been.called();
      });
    });
  });
});
