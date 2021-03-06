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
* Compare a (configurable) list of attributes attributes, ignore other attributes that may be added by React during DOM construction.
* Ignore whitespace when comparing text.
* Automatically integrate with Mocha to show a visual diff in case of a mismatch.

Note that this library is built to serve the needs of actual tests, so there are many missing features. They will be developed as the need arises instead of pre-emptively predicting the need. Feature requests and pull requests are welcome, however.

Comparing attributes
--------------------

It's typical to want to ensure that the constructed DOM elements contain the correct IDs, classes, and other attributes, such as `src` for images. However, React (or possibly other integrated libraries) may add in other attributes, like `data-reactid`, which should not be checked.

`react-dom-assertion` will automatically compare a subset of attributes chosen as semantic attributes. These attributes are chosen because they are likely to be useful if checked. However, if this list doesn't work for you, can amend it by passing in an `additionalCheckedAttributes` list or replace the list completely with a `checkedAttributes` list:

```js
reactDomAssertion.assertSameAsString(expected, actual, {
  // keep checking 'id', 'class', etc., but also check the following:
  additionalCheckedAttributes: [
    'height',
    'width'
  ]
});

reactDomAssertion.assertSameAsString(expected, actual, {
  // don't check 'id', 'class', etc. at all. Instead check only the following:
  checkedAttributes: [
    'height',
    'width'
  ]
});
```

Handling HTML entities
----------------------

The JSX compiler replaces HTML entities with their Unicode equivalents. This means you need to use Unicode characters in your tests:

```js
// In your component's render function:
return (<span>&laquo;quoted&raquo;</span>);

// In your test:
var expected = '<span>«quoted»</span>';
```

You can use the [five pre-defined XML entities](https://en.wikipedia.org/?title=List_of_XML_and_HTML_character_entity_references#Predefined_entities_in_XML) if needed in your tests:

```js
// In your component's render function:
return (<span>&lt;quoted&gt;</span>);

// In your test (notice that &lt; and &gt; have to be escaped):
var expected = '<span>&lt;quoted&gt;</span>';
```

You can use the [online JSX compiler](https://facebook.github.io/react/jsx-compiler.html) to see what is actually being rendered in your component.

Integration with jest
---------------------

If you're working React, it's possible you're using [jest](https://facebook.github.io/jest/) as the testing framework. If so, note that you have to [import `react-dom-assertion` without mocking out its dependencies](https://facebook.github.io/jest/docs/api.html#jest-automockoff):

```js
jest.autoMockOff();
const reactDomAssertion = require('react-dom-assertion');
jest.autoMockOn();

// or

jest.dontMock('react-dom-assertion');
const reactDomAssertion = require('react-dom-assertion');
```

Integration with Jasmine 1.x (including Jest)
---------------------------------------------

At the time of this writing, [Jest still uses Jasmine 1.3.0](https://github.com/facebook/jest/tree/1dab731d1ede877392622f68ae51772a0c3fde6b/vendor/jasmine). Because of this, `react-dom-assertion` supports a custom matcher for Jasmine 1.x:

```js
var reactDomAssertion = require('react-dom-assertion');

// Inside your `describe` block:
beforeEach(reactDomAssertion.jasmine1xMatchers);

// Inside your test:
var rendered = TestUtils.renderIntoDocument(<MyComponent />)
expect(rendered.getDOMNode()).toMatchDOMString(expectedString);

// You can pass in options as well:
expect(rendered.getDOMNode()).toMatchDOMString(expectedString, { /* options */ });
```

The custom matcher also prints both the expected and the actual DOM trees if the matching fails. No visual diff is shown for the purposes of simplicity.

*There is currently no Jasmine 2.x support.*

node.js compatibility
---------------------

One of the crucial dependencies for this library is [jsdom](https://www.npmjs.com/package/jsdom). However, later versions of jsdom are only compatible with io.js, not node.js:

> Note that as of our 4.0.0 release, jsdom no longer works with Node.js&trade; and instead requires io.js. You are still welcome to install a release in the 3.x series if you use Node.js&trade;

Because the code base this library is being tested with still uses node.js, the version of jsdom used is 3.x.

Contributing
------------

1. Fork the repository.
1. Make your changes.
1. Update the tests.
1. Make sure all the tests pass: `npm test`
1. Create a pull request against [avik-das/react-dom-assertion](https://github.com/avik-das/react-dom-assertion).
