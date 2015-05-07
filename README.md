react-dom-assertion
===================

A DOM comparison library intended to make testing React components easier by comparing only the parts that will typically need to be validated in such components.

Quick Start
-----------

Install the library through `npm`:

```sh
npm install react-dom-assertion
```

Then use it in your tests:

```js
const reactDomAssertion = require('react-dom-assertion');

// later in the test...
var rendered = TestUtils.renderIntoDocument(<MyComponent />)

var expected =
  '<element-a id="element-a-id">\n' +
  '  <element-b class="child-class">element-b-text</element-b>\n' +
  '  <element-c class="child-class">element-c-text</element-c>\n' +
  '  <element-d class="child-class">element-d-text</element-d>\n' +
  '</element-a>';

reactDomAssertion.assertSameAsString(expected, rendered.getDOMNode());
```

Features
--------

* Provide a string representation of your expected DOM tree in a string format in tests.
* Compare element `id` and `class` attributes, ignore other attributes that may be added by React during DOM construction.
* Ignore whitespace when comparing text.

Note that this library is built to serve the needs of actual tests, so there are many missing features. They will be developed as the need arises instead of pre-emptively predicting the need. Feature requests and pull requests are welcome, however.

Integration with jest
---------------------

If you're working React, it's possible you're using [jest](https://facebook.github.io/jest/) as the testing framework. If so, note that you have to [import `react-dom-assertion` without mocking out its dependencies](https://facebook.github.io/jest/docs/api.html#jest-automockoff):

```js
jest.autoMockOff()
const reactDomAssertion = require('react-dom-assertion');
jest.autoMockOn()

// or

jest.dontMock('react-dom-assertion');
const reactDomAssertion = require('react-dom-assertion');
```

node.js compatibility
---------------------

One of the crucial dependencies for this library is [jsdom](https://www.npmjs.com/package/jsdom). However, later versions of jsdom are only compatible with io.js, not node.js:

> Note that as of our 4.0.0 release, jsdom no longer works with Node.js&trade; and instead requires io.js. You are still welcome to install a release in the 3.x series if you use Node.js&trade;

Because the code base this library is being tested with still uses node.js, the version of jsdom used is 3.x.
