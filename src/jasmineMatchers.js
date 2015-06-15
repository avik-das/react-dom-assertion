var reactDomAssertion = require('./index');

module.exports.jasmine1xMatchers = function() {
  // As of the time of this writing, Jest still uses Jasmine 1.3.0:
  //
  //   https://github.com/facebook/jest/tree/1dab731d1ede877392622f68ae51772a0c3fde6b/vendor/jasmine
  //
  // Because of this, this library supports a custom matcher for Jasmine 1.x.
  // This function is used by passing it to a `beforeEach` block as follows:
  //
  //   var reactDomAssertion = require('react-dom-assertion');
  //   beforeEach(reactDomAssertion.jasmine1xMatchers);
  //
  // When used in this way, the Jasmine framework will automatically evaluate
  // this function in the context of some internal object, meaning the `this`
  // variable below will contain an `addMatchers` method.
  //
  // For simplicity, and to avoid bringing in a diff library just for this
  // purpose, the expected and actual DOM trees are printed separately, instead
  // of showing the differences. This may be improved in the future.
  this.addMatchers({
    toMatchDOMString: function(expectedStr, options) {
      try {
        reactDomAssertion.assertSameAsString(expectedStr, this.actual, options);
        return true;
      } catch (e) {
        this.message = function() {
          return '\u001b[1;4;31mExpected:\u001b[0;m\n' +
            e.expected + '\n' +
            '\u001b[1;4;31mGot:\u001b[0;m\n' +
            e.actual;
        };

        return false;
      }
    }
  });
};

// If Jasmine 2.x support is to be added, it should be added here and exposed
// just like the 1.x matcher is exposed in index.js.
