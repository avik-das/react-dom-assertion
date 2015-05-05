var jsdom = require('jsdom').jsdom;

var DOMCompareError = Error;

function assertSameTagName(expected, actual) {
  var expectedTagName = expected.tagName.toLowerCase();
  var actualTagName = actual.tagName.toLowerCase();
  if (expectedTagName != actualTagName) {
    throw new DOMCompareError(
      'expected tag: ' + expectedTagName +
        ' but got: ' + actualTagName
    );
  }
}

function assertSameId(expected, actual) {
  var tagName = expected.tagName.toLowerCase();

  if (expected.id && !actual.id) {
    throw new DOMCompareError(
      'expected tag ' + tagName + ' to have id: ' + expected.id +
        ' but no id present'
    );
  }

  if (!expected.id && actual.id) {
    throw new DOMCompareError(
      'expected tag ' + tagName + ' to not have id' +
        ' but got: ' + actual.id
    );
  }

  if (expected.id != actual.id) {
    throw new DOMCompareError(
      'expected tag ' + tagName + ' to have id: ' + expected.id +
        ' but got: ' + actual.id
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

  if (expected.className != actual.className) {
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

  var i = 0;
  for (var child = node.firstChild; child; child = child.nextSibling) {
    if (child.nodeType === node.TEXT_NODE && child.textContent.trim() == '') {
      continue;
    }

    if (child.nodeType == node.COMMENT_NODE) {
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

    if (expectedChildren.length != actualChildren.length) {
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

    if (expectedText != actualText) {
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
