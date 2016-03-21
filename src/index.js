import { addElementResizeListener, removeElementResizeListener } from './element-resize-listener';
import React from 'react';
import { findDOMNode as findDomNode } from 'react-dom';
import { getClosestDppx } from './get-dppx';

export function getSmallPortraitSource(sources, dppx) {
  return sources.reduce((previousSource, currentSource) => {
    if (currentSource.dppx !== dppx) {
      return previousSource;
    }
    const portraitImageRatioCutoff = 2;
    const isLessWide = currentSource.width < previousSource.width;
    const currentImageRatio = Math.abs(currentSource.width / currentSource.height);
    const isPortrait = currentImageRatio < portraitImageRatioCutoff;
    return isLessWide && isPortrait ? currentSource : previousSource;
  });
}

export default class Picture extends React.Component {
  constructor(props, ...rest) {
    super(props, ...rest);
    this.changeImageByWidth = this.changeImageByWidth.bind(this);
    const { sources } = props;
    let isSvgSource = false;
    sources.forEach((source) => {
      if (source.mime && source.mime === 'image/svg+xml') {
        isSvgSource = true;
        sources[0] = source;
        return;
      }
    });
    let smallPortraitSource = {};
    if (isSvgSource === false) {
      const dppx = getClosestDppx(sources);
      smallPortraitSource = getSmallPortraitSource(sources, dppx);
    } else {
      smallPortraitSource = sources[0];
    }
    this.state = {
      ...smallPortraitSource,
      isSvgSource,
    };
  }

  componentDidMount() {
    const { isSvgSource } = this.state;
    if (isSvgSource === false) {
      const element = findDomNode(this);
      addElementResizeListener(element, this.changeImageByWidth);
      this.changeImageByWidth(element.offsetWidth, element.offsetHeight);
    }
  }

  componentWillUnmount() {
    const { isSvgSource } = this.state;
    if (isSvgSource === false) {
      removeElementResizeListener(findDomNode(this), this.changeImageByWidth);
    }
  }

  changeImageByWidth(width, height) {
    const { dppx } = this.state;
    const bestFitImage = this.props.sources.reduce((leftSource, rightSource) => {
      if (Math.abs(rightSource.dppx - dppx) < Math.abs(leftSource.dppx - dppx)) {
        return rightSource;
      }
      const rightSourceWidthDelta = Math.abs(rightSource.width - width);
      const leftSourceWidthDelta = Math.abs(leftSource.width - width);
      if (rightSourceWidthDelta === leftSourceWidthDelta) {
        const rightSourceHeightDelta = Math.abs(rightSource.height - height);
        const leftSourceHeightDelta = Math.abs(leftSource.height - height);
        return (rightSourceHeightDelta < leftSourceHeightDelta) ? rightSource : leftSource;
      }
      return (rightSourceWidthDelta < leftSourceWidthDelta) ? rightSource : leftSource;
    }, this.props.sources[0]);
    this.setState(bestFitImage);
  }

  render() {
    const { url, isSvgSource } = this.state || {};
    const { className, alt, ...remainingProps } = this.props;
    const imageProps = { alt, src: url };
    /* eslint-disable id-blacklist */
    const svgProps = { type: 'image/svg+xml', data: url };
    /* eslint-enable id-blacklist */
    const pictureElement = (isSvgSource === false) ? (<img {...imageProps} />) : (<object {...svgProps} />);
    const wrapperProps = {
      ...remainingProps,
      className: [ 'picture' ].concat(className).join(' ').trim(),
    };
    return (
      <div {...wrapperProps}>
        {pictureElement}
      </div>
    );
  }
}

Picture.defaultProps = {
  alt: '',
  sources: [],
};

if (process.env.NODE_ENV !== 'production') {
  Picture.propTypes = {
    className: React.PropTypes.oneOfType([
      React.PropTypes.string,
      React.PropTypes.array,
    ]),
    alt: React.PropTypes.string.isRequired,
    sources: React.PropTypes.arrayOf(React.PropTypes.shape({
      url: React.PropTypes.string.isRequired,
      width: React.PropTypes.number.isRequired,
      height: React.PropTypes.number.isRequired,
      dppx: React.PropTypes.number.isRequired,
      mime: React.PropTypes.string,
    })).isRequired,
  };
}
