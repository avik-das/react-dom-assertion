var jsdom = require('jsdom').jsdom;

var DOMCompareError = Error;

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

function assertSameId(expected, actual) {
  var tagName = expected.tagName.toLowerCase();

  var expectedId = getNullableAttributeValue(expected, 'id');
  var actualId = getNullableAttributeValue(actual, 'id');

  if (expectedId && !actualId) {
    throw new DOMCompareError(
      'expected tag ' + tagName + ' to have id: ' + expectedId +
        ' but no id present'
    );
  }

  if (!expectedId && actualId) {
    throw new DOMCompareError(
      'expected tag ' + tagName + ' to not have id' +
        ' but got: ' + actualId
    );
  }

  if (expectedId !== actualId) {
    throw new DOMCompareError(
      'expected tag ' + tagName + ' to have id: ' + expectedId +
        ' but got: ' + actualId
    );
  }
}

function assertSameClass(expected, actual) {
  var tagName = expected.tagName.toLowerCase();

  if (expected.className && !actual.className) {
    throw new DOMCompareError(
      'expected tag ' + tagName + ' to have class: ' + expected.className +
        ' but no class present'
    );
  }

  if (!expected.className && actual.className) {
    throw new DOMCompareError(
      'expected tag ' + tagName + ' to not have class' +
        ' but got: ' + actual.className
    );
  }

  if (expected.className !== actual.className) {
    throw new DOMCompareError(
      'expected tag ' + tagName + ' to have class: ' + expected.className +
        ' but got: ' + actual.className
    );
  }
}

function assertSameAsString(expectedStr, actualDOM) {
  var expectedDOM = jsdom(expectedStr, { parsingMode: 'xml' })
    .children
    .item(0);

  assertSameDOMs(expectedDOM, actualDOM);
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

function assertSameDOMs(expected, actual) {
  var expectedIsElement = expected.nodeType === expected.ELEMENT_NODE;
  var actualIsElement = actual.nodeType === actual.ELEMENT_NODE;

  var expectedIsText = expected.nodeType === expected.TEXT_NODE;
  var actualIsText = actual.nodeType === actual.TEXT_NODE;

  if (expectedIsElement && actualIsElement) {
    assertSameTagName(expected, actual);
    assertSameId(expected, actual);
    assertSameClass(expected, actual);

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
      assertSameDOMs(expectedChild, actualChild);
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
