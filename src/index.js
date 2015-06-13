var jsdom = require('jsdom').jsdom;

var DOMCompareError = Error;

// These attributes have been chosen as ones that are highly semantic and often
// depend on the data used to construct the DOM. Ones that are omitted in this
// list are presentational attributes (such as "align"), behaviorial attributes
// (such as "onclick"), and ones that are often internal to whatever framework
// creates or uses the DOM (such as "data-*").
var DEFAULT_CHECKED_ATTRIBUTES = [
  'id',
  'class',

  'href', // links
  'src', // media, e.g. img, video

  // for forms
  'readonly',
  'value',
  'checked'
];

function prettyPrintedLines(node, options) {
  options = options || {};
  options.checkedAttributes = options.checkedAttributes || [];

  if (node.nodeType === node.TEXT_NODE) {
    return [node.textContent.trim()];
  }

  var name = node.nodeName.toLowerCase();
  var children = getLogicalChildren(node);

  var attributeStr = options
    .checkedAttributes
    .filter(function(attrName) {
      return node.hasAttribute(attrName);
    })
    .map(function(attrName) {
      return attrName + '="' + node.getAttribute(attrName) + '"';
    })
    .join(' ');

  if (attributeStr) {
    attributeStr = ' ' + attributeStr;
  }

  if (children.length === 0) {
    return ['<' + name + attributeStr + '/>'];
  }

  var lines = [];
  lines.push('<' + name + attributeStr + '>');

  children.forEach(function(child) {
    var childLines = prettyPrintedLines(child, options);
    childLines.forEach(function(childLine) {
      lines.push('  ' + childLine);
    });
  });

  lines.push('</' + name + '>');

  return lines;
}

function prettyPrinted(node, options) {
  return prettyPrintedLines(node, options).join('\n');
}

function assertSameTagName(expected, actual) {
  var expectedTagName = expected.tagName.toLowerCase();
  var actualTagName = actual.tagName.toLowerCase();
  if (expectedTagName !== actualTagName) {
    throw new DOMCompareError(
      'expected tag: ' + expectedTagName +
        ' but got: ' + actualTagName
    );
  }
}

function getNullableAttributeValue(elem, attrName) {
  var value = elem.getAttribute(attrName) || null;

  // It turns out that if an attribute is set via:
  //
  //   elem.setAttribute(attrName, null);
  //
  // then, when retrieving that attribute, the value doesn't come back as null,
  // but as the _string_ "null". This is what happens in the case of React and
  // JSX apparently, so we'll assume that no one is setting the value to be the
  // string "null" deliberately.
  if (value === 'null') {
    value = null;
  }

  return value;
}

function assertSameAttribute(expected, actual, attributeName) {
  var tagName = expected.tagName.toLowerCase();

  var expectedAttribute = getNullableAttributeValue(expected, attributeName);
  var actualAttribute = getNullableAttributeValue(actual, attributeName);

  if (expectedAttribute && !actualAttribute) {
    throw new DOMCompareError(
      'expected tag ' + tagName + ' to have ' + attributeName + ': ' +
        expectedAttribute + ' but no ' + attributeName + ' present'
    );
  }

  if (!expectedAttribute && actualAttribute) {
    throw new DOMCompareError(
      'expected tag ' + tagName + ' to not have ' + attributeName +
        ' but got: ' + actualAttribute
    );
  }

  if (expectedAttribute !== actualAttribute) {
    throw new DOMCompareError(
      'expected tag ' + tagName + ' to have ' + attributeName + ': ' +
        expectedAttribute + ' but got: ' + actualAttribute
    );
  }
}

function computeCheckedAttributesList(options) {
  options = options || {};

  var attributes = [];

  // Start by copying over either the passed in attributes or the default ones
  // to a new array. This ensures that the default list is not modified when
  // merging in the additional attributes.

  var baseAttributes = options.checkedAttributes || DEFAULT_CHECKED_ATTRIBUTES;
  baseAttributes.forEach(function(attr) {
    // The inclusion check avoids duplicates in the passed in attributes.
    if (attributes.indexOf(attr) === -1) {
      attributes.push(attr);
    }
  });

  // Merge in any additional ones. It's expected that the additional ones will
  // only be passed in if the default attribute list is used, but we'll merge
  // both the base and additional passed in lists if provided. This is to
  // ensure the principle of least surprise.

  var additional = options.additionalCheckedAttributes || [];
  additional.forEach(function(add) {
    if (attributes.indexOf(add) === -1) {
      attributes.push(add);
    }
  });

  return attributes;
}

function assertSameAsString(expectedStr, actualDOM, options) {
  var processedOptions = {
    checkedAttributes: computeCheckedAttributesList(options)
  };

  var expectedDOM = jsdom(expectedStr, { parsingMode: 'xml' })
    .children
    .item(0);

  try {
    assertSameDOMs(expectedDOM, actualDOM, processedOptions);
  } catch (e) {
    if (!(e instanceof DOMCompareError)) {
      throw e;
    }

    // Make sure to manually print out both the expected and actual DOM trees so
    // they're both printed with the same formatting. This helps minimize the
    // number of unnecessary artifacts in the diff.
    //
    // Setting these fields makes sure mocha shows the diff. For other testing
    // frameworks, YMMV.
    e.showDiff = true;
    e.expected = prettyPrinted(expectedDOM, processedOptions);
    e.actual = prettyPrinted(actualDOM, processedOptions);
    throw e;
  }
}

function getLogicalChildren(node) {
  var children = [];

  if (!node.hasChildNodes()) {
    return children;
  }

  for (var child = node.firstChild; child; child = child.nextSibling) {
    if (child.nodeType === node.TEXT_NODE && child.textContent.trim() === '') {
      continue;
    }

    if (child.nodeType === node.COMMENT_NODE) {
      continue;
    }

    children.push(child);
  }

  return children;
}

function assertSameDOMs(expected, actual, options) {
  var expectedIsElement = expected.nodeType === expected.ELEMENT_NODE;
  var actualIsElement = actual.nodeType === actual.ELEMENT_NODE;

  var expectedIsText = expected.nodeType === expected.TEXT_NODE;
  var actualIsText = actual.nodeType === actual.TEXT_NODE;

  if (expectedIsElement && actualIsElement) {
    assertSameTagName(expected, actual);

    options.checkedAttributes.forEach(function(attributeName) {
      assertSameAttribute(expected, actual, attributeName);
    });

    var tagName = expected.tagName.toLowerCase();

    var expectedChildren = getLogicalChildren(expected);
    var actualChildren = getLogicalChildren(actual);

    if (expectedChildren.length !== actualChildren.length) {
      throw new DOMCompareError(
        'expected tag ' + tagName + ' to have ' + expectedChildren.length +
          ' children but got ' + actualChildren.length
      );
    }

    for (var i = 0; i < expectedChildren.length; i++) {
      var expectedChild = expectedChildren[i];
      var actualChild = actualChildren[i];
      assertSameDOMs(expectedChild, actualChild, options);
    }
  } else if (expectedIsText && actualIsText) {
    var expectedText = expected.textContent.trim();
    var actualText = actual.textContent.trim();

    if (expectedText !== actualText) {
      throw new DOMCompareError(
        'mismatched text content: ' + expectedText +
          ' != ' + actualText
      );
    }
  } else if (expectedIsText && actualIsElement) {
    var parentTagName = actual.parentNode.tagName.toLowerCase();
    var actualTagName = actual.tagName.toLowerCase();
    throw new DOMCompareError(
      'expected tag ' + parentTagName + ' to contain text but found tag ' +
        actualTagName
    );
  }
}

module.exports.assertSameAsString = assertSameAsString;
