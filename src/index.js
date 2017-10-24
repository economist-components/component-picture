import { addElementResizeListener, removeElementResizeListener } from './element-resize-listener';
import React from 'react';
import { findDOMNode as findDomNode } from 'react-dom';
import { getClosestDppx } from './get-dppx';
import PropTypes from 'prop-types';

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
    this.hasChanged = false;
    const { sources } = props;
    const svgSource = sources
      .filter((source) => source.mime && source.mime === 'image/svg+xml')
      .pop();
    const isSvgSource = Boolean(svgSource);
    let smallPortraitSource = {};
    if (isSvgSource) {
      smallPortraitSource = svgSource;
    } else {
      const dppx = getClosestDppx(sources);
      smallPortraitSource = getSmallPortraitSource(sources, dppx);
    }

    this.state = {
      ...smallPortraitSource,
      isSvgSource,
    };
  }

  componentDidMount() {
    if (this.state.isSvgSource === false) {
      const element = findDomNode(this);
      addElementResizeListener(element, this.changeImageByWidth);
      this.changeImageByWidth(element.offsetWidth, element.offsetHeight);
    }
  }

  componentWillUnmount() {
    if (this.state.isSvgSource === false) {
      removeElementResizeListener(findDomNode(this), this.changeImageByWidth);
    }
  }

  changeImageByWidth(width, height) {
    const { dppx } = this.state;
    const bestFitImage = this.props.sources.reduce((leftSource, rightSource) => {
      if (Math.abs(rightSource.dppx - dppx) < Math.abs(leftSource.dppx - dppx)) {
        return rightSource;
      }
      if (rightSource.width < width && leftSource.width >= width) {
        return leftSource;
      }
      if (leftSource.width < width && rightSource.width >= width) {
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
    });
    this.setState(bestFitImage);
  }

  render() {
    const { url, isSvgSource } = this.state || {};
    const { className, classNameImage, classNameObject, alt, itemProp } = this.props;
    let pictureElement = null;
    if (isSvgSource) {
      const objectClassnames = [ 'picture__object' ];
      if (classNameObject) {
        objectClassnames.push(classNameObject);
      }
      pictureElement = (
        <object
          type="image/svg+xml"
          data={url}
          itemProp={itemProp}
          className={objectClassnames.join(' ').trim()}
        />
      );
    } else {
      const imageClassnames = [ 'picture__image' ];
      if (!this.hasChanged) {
        this.hasChanged = true;
        imageClassnames.push('picture__image--changed');
      }
      if (classNameImage) {
        imageClassnames.push(classNameImage);
      }
      pictureElement = (
        <img
          alt={alt}
          src={url}
          itemProp={itemProp}
          className={imageClassnames.join(' ').trim()}
        />
      );
    }
    return (
      <div className={[ 'picture' ].concat(className).join(' ').trim()}>
        {pictureElement}
      </div>
    );
  }
}

Picture.defaultProps = {
  alt: '',
  sources: [],
  itemProp: 'image',
};

if (process.env.NODE_ENV !== 'production') {
  Picture.propTypes = {
    itemProp: PropTypes.string,
    className: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.array,
    ]),
    classNameObject: PropTypes.string,
    classNameImage: PropTypes.string,
    alt: PropTypes.string.isRequired,
    sources: PropTypes.arrayOf(PropTypes.shape({
      url: PropTypes.string.isRequired,
      width: PropTypes.number.isRequired,
      height: PropTypes.number,
      dppx: PropTypes.number,
      mime: PropTypes.string,
    })).isRequired,
  };
}
