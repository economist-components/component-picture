import 'babel-polyfill';
import React from 'react';
import Picture from '../src';
import * as dppxUtils from '../src/get-dppx';
import * as reactDom from 'react-dom';
import * as resizeUtils from '../src/element-resize-listener';
import { mount, shallow } from 'enzyme';
import chai from 'chai';
import chaiEnzyme from 'chai-enzyme';
import chaiSpies from 'chai-spies';
chai.use(chaiEnzyme()).use(chaiSpies).should();

describe('Picture', () => {
  it('renders a React element', () => {
    React.isValidElement(<Picture />).should.equal(true);
  });

  describe('initial state', () => {
    let picture = null;
    let rendered = null;
    it('sets state.{dppx,url,width,height} to first image that matches closest dppx (1)', () => {
      dppxUtils.getClosestDppx = chai.spy(() => 1);
      rendered = shallow(
        <Picture
          alt="foo"
          sources={[
            { url: 'https://placehold.it/1792x1008', width: 896, height: 504, dppx: 2 },
            { url: 'https://placehold.it/400x500', width: 400, height: 500, dppx: 1 },
            { url: 'https://placehold.it/300x400', width: 300, height: 400, dppx: 2 },
            { url: 'https://placehold.it/896x504', width: 896, height: 504, dppx: 1 },
          ]}
        />
      );
      picture = rendered.find('.picture');
      picture.should.contain(
        <img
          alt="foo"
          src="https://placehold.it/400x500"
          itemProp="image"
          className="picture__image picture__image--changed"
        />
      );
    });

    it('sets state.{dppx,url,width,height} to first image that matches closest dppx (2)', () => {
      dppxUtils.getClosestDppx = chai.spy(() => 2);
      rendered = shallow(
        <Picture
          alt="foo"
          sources={[
            { url: 'https://placehold.it/1792x1008', width: 896, height: 504, dppx: 2 },
            { url: 'https://placehold.it/400x500', width: 400, height: 500, dppx: 1 },
            { url: 'https://placehold.it/300x400', width: 300, height: 400, dppx: 2 },
            { url: 'https://placehold.it/896x504', width: 896, height: 504, dppx: 1 },
          ]}
        />
      );
      picture = rendered.find('.picture');
      picture.should.contain(
        <img
          alt="foo"
          src="https://placehold.it/300x400"
          itemProp="image"
          className="picture__image picture__image--changed"
        />
      );
    });
  });

  describe('componentDidMount', () => {
    let reactDomRef = null;
    let picture = null;
    beforeEach(() => {
      picture = new Picture({
        sources: [
          { url: 'https://placehold.it/1792x1008', width: 896, height: 504, dppx: 2 },
        ],
        alt: 'foo',
      });
      picture.refs = { picture: {} };
      reactDomRef = {};
      reactDom.findDOMNode = reactDom.default.findDOMNode = chai.spy(() => reactDomRef);
      resizeUtils.addElementResizeListener = chai.spy();
      resizeUtils.removeElementResizeListener = chai.spy();
    });

    it('calls addElementResizeListener(findDOMNode(this), this.changeImageByWidth)', () => {
      picture.componentDidMount();
      reactDom.findDOMNode
        .should.have.been.called(1)
        .with.exactly(picture);
      resizeUtils.addElementResizeListener
        .should.have.been.called(1)
        .with.exactly(reactDomRef, picture.changeImageByWidth);
    });
  });

  describe('componentWillUnmount', () => {
    let reactDomRef = null;
    let picture = null;
    beforeEach(() => {
      picture = new Picture({
        sources: [
          { url: 'https://placehold.it/1792x1008', width: 896, height: 504, dppx: 2 },
        ],
        alt: 'foo',
      });
      picture.refs = { picture: {} };
      reactDomRef = {};
      reactDom.findDOMNode = reactDom.default.findDOMNode = chai.spy(() => reactDomRef);
      resizeUtils.addElementResizeListener = chai.spy();
      resizeUtils.removeElementResizeListener = chai.spy();
    });

    it('calls removeElementResizeListener(findDOMNode(this), this.changeImageByWidth)', () => {
      picture.componentWillUnmount();
      reactDom.findDOMNode
        .should.have.been.called(1)
        .with.exactly(picture);
      resizeUtils.removeElementResizeListener
        .should.have.been.called(1)
        .with.exactly(reactDomRef, picture.changeImageByWidth);
    });
  });

  describe('changeImageByWidth', () => {
    let picture = null;
    beforeEach(() => {
      picture = new Picture({
        sources: [
          { url: 'https://placehold.it/1792x1008', width: 896, height: 504, dppx: 2 },
          { url: 'https://placehold.it/896x504', width: 896, height: 504, dppx: 1 },
          { url: 'https://placehold.it/1536x864', width: 768, height: 432, dppx: 2 },
          { url: 'https://placehold.it/768x432', width: 768, height: 432, dppx: 1 },
          { url: 'https://placehold.it/1280x720', width: 640, height: 360, dppx: 2 },
          { url: 'https://placehold.it/640x470', width: 640, height: 360, dppx: 1 },
        ],
        alt: 'foo',
      });
      picture.setState = (state) => (picture.state = { ...picture.state, ...state });
    });

    it('sets state.url to the best image to the given (width, height)', () => {
      picture.state.dppx = 1;
      picture.changeImageByWidth(2000, 2000);
      picture.state.url.should.equal('https://placehold.it/896x504', 'best is 896x504');
      picture.changeImageByWidth(890, 500);
      picture.state.url.should.equal('https://placehold.it/896x504', 'best is 896x504');
      picture.changeImageByWidth(770, 450);
      picture.state.url.should.equal('https://placehold.it/896x504', 'best is 896x504');
      picture.changeImageByWidth(750, 450);
      picture.state.url.should.equal('https://placehold.it/768x432', 'best is 768x432');
    });

    it('only picks images with appropriate dppx', () => {
      picture.state.dppx = 2;
      picture.changeImageByWidth(2000, 2000);
      picture.state.url.should.equal('https://placehold.it/1792x1008', 'closest to 2000x2000-dppx2');
      picture.state.dppx = 1;
      picture.changeImageByWidth(2000, 2000);
      picture.state.url.should.equal('https://placehold.it/896x504', 'closest to 2000x2000-dppx1');
      picture.state.dppx = 3;
      picture.changeImageByWidth(2000, 2000);
      picture.state.url.should.equal('https://placehold.it/1792x1008', 'closest to 2000x2000-dppx3');
      picture.state.dppx = 0.5;
      picture.changeImageByWidth(2000, 2000);
      picture.state.url.should.equal('https://placehold.it/896x504', 'closest to 2000x2000-dppx0.5');
    });
  });

  describe('Rendering', () => {
    let rendered = null;
    let picture = null;
    before(() => {
      rendered = mount(
        <Picture
          sources={[
            { url: 'https://placehold.it/896x504', width: 896, height: 504, dppx: 1 },
          ]}
          alt="foobar"
          className={[ 'foo', 'fiz' ]}
          itemProp="blarg"
        />
      );
      picture = rendered.find('.picture');
    });

    it('renders a div.picture with an <img> tag, with src from state.url', () => {
      picture.should.have.tagName('div');
      picture.should.have.className('picture');
      const img = picture.find('img');
      img.should.have.attr('src', 'https://placehold.it/896x504');
    });

    it('renders <img> alt from props.alt', () => {
      const img = picture.find('img');
      img.should.have.attr('alt', 'foobar');
    });

    it('renders div className based on props.className', () => {
      picture.should.have.className('foo').and.have.className('fiz');
    });

    it('can be given arbitrary props to render', () => {
      picture.find('img').should.have.attr('itemprop', 'blarg');
    });
  });

  describe('SVG', () => {
    let rendered = null;
    let picture = null;
    before(() => {
      rendered = mount(
        <Picture
          sources={[
            { url: 'https://placehold.it/896x504', width: 896, height: 504, dppx: 1 },
            { url: 'some-file.svg', mime: 'image/svg+xml' },
          ]}
          alt="foobar"
        />
      );
      picture = rendered.find('.picture');
    });

    it('ignores other image files if an SVG file is present', () => {
      const svgObject = picture.find('object');
      svgObject.should.have.attr('data', 'some-file.svg');
    });
  });
});
