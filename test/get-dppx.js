/* global window */
import 'babel-polyfill';
import { getClosestDppx, getDppx } from '../src/get-dppx';
import chai from 'chai';
chai.should();

describe('getDppx', () => {
  const globalObject = (typeof window === 'undefined') ? global : window;
  it('returns devicePixelRatio if set', () => {
    getDppx({ devicePixelRatio: 17 }).should.equal(17);
    getDppx({ devicePixelRatio: 4 }).should.equal(4);
  });

  it('calculates dppx from deviceX/YDPI if available', () => {
    /* eslint-disable id-match */
    getDppx({ screen: { deviceXDPI: 72, deviceYDPI: 72 } }).should.equal(0.75);
    getDppx({ screen: { deviceXDPI: 96, deviceYDPI: 96 } }).should.equal(1);
    getDppx({ screen: { deviceXDPI: 400, deviceYDPI: 400 } }).should.equal(4.17);
    getDppx({ screen: { deviceXDPI: 518, deviceYDPI: 518 } }).should.equal(5.4);
    /* eslint-enable id-match */
  });

  it('returns 1 if devicePixelRatio or deviceXDPI is not present', () => {
    getDppx({}).should.equal(1);
  });

  describe('getClosestDppx', () => {

    it('returns number closest number in array', () => {
      getClosestDppx([ 1, 2, 3 ], 2.6).should.equal(3);
      getClosestDppx([ 1, 2, 3 ], 2.2).should.equal(2);
      getClosestDppx([ 1, 2, 3 ], 18).should.equal(3);
      getClosestDppx([ 1, 2, 3 ], 0.4).should.equal(1);
    });

    it('returns closest `dppx` value from array of objects', () => {
      getClosestDppx([ { dppx: 1 }, { dppx: 2 }, { dppx: 3 } ], 2.6).should.equal(3);
      getClosestDppx([ { dppx: 1 }, { dppx: 2 }, { dppx: 3 } ], 2.2).should.equal(2);
      getClosestDppx([ { dppx: 1 }, { dppx: 2 }, { dppx: 3 } ], 18).should.equal(3);
      getClosestDppx([ { dppx: 1 }, { dppx: 2 }, { dppx: 3 } ], 0.4).should.equal(1);
    });

    it('defaults second argument to be getDppx', () => {
      globalObject.window = globalObject.window || {};
      globalObject.window.devicePixelRatio = 3;
      getClosestDppx([ 1, 2, 3 ]).should.equal(3);
    });
  });
});
