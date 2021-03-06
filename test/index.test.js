var reactDomAssertion = require('../src/index');
var jsdom = require('jsdom').jsdom;
var expect = require('chai').expect;

describe('reactDomAssertion', function() {
  describe('#assertSameAsString', function() {
    it('compares correctly', function() {
      var expected =
        '<element-a id="element-a-id">\n' +
        '  <element-b class="child-class">element-b-text</element-b>\n' +
        '  <element-c class="child-class">element-c-text</element-c>\n' +
        '  <element-d class="child-class">element-d-text</element-d>\n' +
        '</element-a>';

      var document = jsdom('');

      var ea = document.createElement('element-a');
      ea.id = 'element-a-id';

      var eb = document.createElement('element-b');
      eb.className = 'child-class';
      eb.textContent = 'element-b-text';
      ea.appendChild(eb);

      var ec = document.createElement('element-c');
      ec.className = 'child-class';
      ec.textContent = 'element-c-text';
      ea.appendChild(ec);

      var ed = document.createElement('element-d');
      ed.className = 'child-class';
      ed.textContent = 'element-d-text';
      ea.appendChild(ed);

      reactDomAssertion.assertSameAsString(expected, ea);
    });

    it('handles elements without attributes', function() {
      var expected =
        '<element-a>\n' +
        '  <element-b />\n' +
        '  <element-c />\n' +
        '  <element-d />\n' +
        '</element-a>';

      var document = jsdom('');

      var ea = document.createElement('element-a');

      var eb = document.createElement('element-b');
      ea.appendChild(eb);

      var ec = document.createElement('element-c');
      ea.appendChild(ec);

      var ed = document.createElement('element-d');
      ea.appendChild(ed);

      reactDomAssertion.assertSameAsString(expected, ea);
    });

    it('handles mixed text and elements', function() {
      var expected =
        '<element-a>\n' +
        '  text-content-0\n' +
        '  <element-b />\n' +
        '  text-content-1\n' +
        '</element-a>';
      var document = jsdom('');

      var ea = document.createElement('element-a');

      var t0 = document.createTextNode('text-content-0');
      ea.appendChild(t0);

      var eb = document.createElement('element-b');
      ea.appendChild(eb);

      var t1 = document.createTextNode('text-content-1');
      ea.appendChild(t1);

      reactDomAssertion.assertSameAsString(expected, ea);
    });

    it('handles attributes without values', function() {
      var expected = '<element-a attr-without-value />';
      var document = jsdom('');

      var ea = document.createElement('element-a');
      ea.setAttribute('attr-without-value', '');

      reactDomAssertion.assertSameAsString(expected, ea, {
        additionalCheckedAttributes: ['attr-without-value']
      });
    });

    it('ignores comments', function() {
      var expected =
        '<element-a>\n' +
        '  <element-b />\n' +
        '  <!-- comment -->\n' +
        '  <element-c />\n' +
        '</element-a>';

      var document = jsdom('');

      var ea = document.createElement('element-a');

      var eb = document.createElement('element-b');
      ea.appendChild(eb);

      var ec = document.createElement('element-c');
      ea.appendChild(ec);

      reactDomAssertion.assertSameAsString(expected, ea);
    });

    it('handles empty-like IDs', function() {
      var expected = '<element-a />';

      var document = jsdom('');

      var ea = document.createElement('element-a');
      ea.setAttribute('id', null);

      reactDomAssertion.assertSameAsString(expected, ea);
    });

    it('flags an invalid root element', function() {
      var expected =
        '<element-a id="element-a-id">\n' +
        '  <element-b class="child-class"/>\n' +
        '  <element-c class="child-class"/>\n' +
        '  <element-d class="child-class"/>\n' +
        '</element-a>';

      var document = jsdom('');

      // Only the element name of the root is different. Everything else
      // matches perfectly.
      var ea = document.createElement('element-invalid');
      ea.id = 'element-a-id';

      var eb = document.createElement('element-b');
      eb.className = 'child-class';
      ea.appendChild(eb);

      var ec = document.createElement('element-c');
      ec.className = 'child-class';
      ea.appendChild(ec);

      var ed = document.createElement('element-d');
      ed.className = 'child-class';
      ea.appendChild(ed);

      expect(function() {
        reactDomAssertion.assertSameAsString(expected, ea);
      }).to.throw(/expected tag: element-a but got: element-invalid/);
    });

    it('flags a root element with the wrong ID', function() {
      var expected =
        '<element-a id="element-a-id">\n' +
        '  <element-b class="child-class"/>\n' +
        '  <element-c class="child-class"/>\n' +
        '  <element-d class="child-class"/>\n' +
        '</element-a>';

      var document = jsdom('');

      // Only the ID of the root is different. Everything else matches
      // perfectly.
      var ea = document.createElement('element-a');
      ea.id = 'element-a-id-invalid';

      var eb = document.createElement('element-b');
      eb.className = 'child-class';
      ea.appendChild(eb);

      var ec = document.createElement('element-c');
      ec.className = 'child-class';
      ea.appendChild(ec);

      var ed = document.createElement('element-d');
      ed.className = 'child-class';
      ea.appendChild(ed);

      expect(function() {
        reactDomAssertion.assertSameAsString(expected, ea);
      }).to.throw(/expected tag element-a to have id: element-a-id but got: element-a-id-invalid/);
    });

    it('flags a root element with the wrong class', function() {
      var expected =
        '<element-a class="element-a-class">\n' +
        '  <element-b class="child-class"/>\n' +
        '  <element-c class="child-class"/>\n' +
        '  <element-d class="child-class"/>\n' +
        '</element-a>';

      var document = jsdom('');

      // Only the class of the root is different. Everything else matches
      // perfectly.
      var ea = document.createElement('element-a');
      ea.className = 'element-a-class-invalid';

      var eb = document.createElement('element-b');
      eb.className = 'child-class';
      ea.appendChild(eb);

      var ec = document.createElement('element-c');
      ec.className = 'child-class';
      ea.appendChild(ec);

      var ed = document.createElement('element-d');
      ed.className = 'child-class';
      ea.appendChild(ed);

      expect(function() {
        reactDomAssertion.assertSameAsString(expected, ea);
      }).to.throw(/expected tag element-a to have class: element-a-class but got: element-a-class-invalid/);
    });

    it('compares the DOM recursively', function() {
      var expected =
        '<element-a id="element-a-id">\n' +
        '  <element-b class="child-class">\n' +
        '    <element-b-child class="grandchild-class"/>\n' +
        '  </element-b>\n' +
        '  <element-c class="child-class">\n' +
        '    <element-c-child class="grandchild-class"/>\n' +
        '  </element-c>\n' +
        '  <element-d class="child-class">\n' +
        '    <element-d-child class="grandchild-class"/>\n' +
        '  </element-d>\n' +
        '</element-a>';

      var document = jsdom('');

      var ea = document.createElement('element-a');
      ea.id = 'element-a-id';

      var eb = document.createElement('element-b');
      eb.className = 'child-class';
      ea.appendChild(eb);

      var ebc = document.createElement('element-b-child');
      ebc.className = 'grandchild-class';
      eb.appendChild(ebc);

      var ec = document.createElement('element-c');
      ec.className = 'child-class';
      ea.appendChild(ec);

      // Only an incorrect name for this grandchild
      var ecc = document.createElement('element-c-child-invalid');
      ecc.className = 'grandchild-class';
      ec.appendChild(ecc);

      var ed = document.createElement('element-d');
      ed.className = 'child-class';
      ea.appendChild(ed);

      var edc = document.createElement('element-d-child');
      edc.className = 'grandchild-class';
      ed.appendChild(edc);

      expect(function() {
        reactDomAssertion.assertSameAsString(expected, ea);
      }).to.throw(/expected tag: element-c-child but got: element-c-child-invalid/);
    });

    it('checks the number of children at each level', function() {
      var expected =
        '<element-a id="element-a-id">\n' +
        '  <element-b class="child-class"/>\n' +
        '  <element-c class="child-class"/>\n' +
        '  <element-d class="child-class"/>\n' +
        '</element-a>';

      var document = jsdom('');

      var ea = document.createElement('element-a');
      ea.id = 'element-a-id';

      var eb = document.createElement('element-b');
      eb.className = 'child-class';
      ea.appendChild(eb);

      // Missing element-c

      var ed = document.createElement('element-d');
      ed.className = 'child-class';
      ea.appendChild(ed);

      expect(function() {
        reactDomAssertion.assertSameAsString(expected, ea);
      }).to.throw(/expected tag element-a to have 3 children but got 2/);
    });

    it('correctly reports a missing ID', function() {
      var expected = '<element-a id="element-a-id"/>';
      var document = jsdom('');

      var ea = document.createElement('element-a');
      expect(function() {
        reactDomAssertion.assertSameAsString(expected, ea);
      }).to.throw(/expected tag element-a to have id: element-a-id but no id present/);
    });

    it('correctly reports an unexpected ID', function() {
      var expected = '<element-a />';
      var document = jsdom('');

      var ea = document.createElement('element-a');
      ea.id = 'element-a-id';

      expect(function() {
        reactDomAssertion.assertSameAsString(expected, ea);
      }).to.throw(/expected tag element-a to not have id but got: element-a-id/);
    });

    it('correctly reports a missing class', function() {
      var expected = '<element-a class="element-a-class"/>';
      var document = jsdom('');

      var ea = document.createElement('element-a');
      expect(function() {
        reactDomAssertion.assertSameAsString(expected, ea);
      }).to.throw(/expected tag element-a to have class: element-a-class but no class present/);
    });

    it('correctly reports an unexpected class', function() {
      var expected = '<element-a />';
      var document = jsdom('');

      var ea = document.createElement('element-a');
      ea.className = 'element-a-class';

      expect(function() {
        reactDomAssertion.assertSameAsString(expected, ea);
      }).to.throw(/expected tag element-a to not have class but got: element-a-class/);
    });

    it('correctly flags a missing attribute without a value', function() {
      var expected =
        '<element-a>\n' +
        '  <element-b attr-without-value />\n' +
        '</element-a>';

      var document = jsdom('');

      var ea = document.createElement('element-a');

      var eb = document.createElement('element-b');
      ea.appendChild(eb);

      expect(function() {
        reactDomAssertion.assertSameAsString(expected, ea, {
          additionalCheckedAttributes: ['attr-without-value']
        });
      }).to.throw(/expected tag element-b to have attr-without-value:  but no attr-without-value present/);
    });

    it('correctly flags an unexpected attribute without a value', function() {
      var expected =
        '<element-a>\n' +
        '  <element-b />\n' +
        '</element-a>';

      var document = jsdom('');

      var ea = document.createElement('element-a');

      var eb = document.createElement('element-b');
      eb.setAttribute('attr-without-value', '');
      ea.appendChild(eb);

      expect(function() {
        reactDomAssertion.assertSameAsString(expected, ea, {
          additionalCheckedAttributes: ['attr-without-value']
        });
      }).to.throw(/expected tag element-b to not have attr-without-value but got: /);
    });

    it('correctly reports a mismatched checked attribute', function() {
      var expected = '<element-a href="href-value" />';
      var document = jsdom('');

      var ea = document.createElement('element-a');
      ea.setAttribute('href', 'wrong-href-value');

      expect(function() {
        reactDomAssertion.assertSameAsString(expected, ea);
      }).to.throw(/expected tag element-a to have href: href-value but got: wrong-href-value/);
    });

    it('correctly reports a missing checked attribute', function() {
      var expected = '<element-a href="href-value" />';
      var document = jsdom('');

      var ea = document.createElement('element-a');

      expect(function() {
        reactDomAssertion.assertSameAsString(expected, ea);
      }).to.throw(/expected tag element-a to have href: href-value but no href present/);
    });

    it('correctly reports an unexpected checked attribute', function() {
      var expected = '<element-a />';
      var document = jsdom('');

      var ea = document.createElement('element-a');
      ea.setAttribute('href', 'href-value');

      expect(function() {
        reactDomAssertion.assertSameAsString(expected, ea);
      }).to.throw(/expected tag element-a to not have href but got: href-value/);
    });

    it('ignores unchecked attribute mismatches', function() {
      var expected = '<element-a />';
      var document = jsdom('');

      var ea = document.createElement('element-a');
      ea.setAttribute('onclick', 'onclick-handler');

      reactDomAssertion.assertSameAsString(expected, ea);
    });

    it('recognizes passed in additional checked attributes', function() {
      var expected = '<element-a />';
      var document = jsdom('');

      var ea = document.createElement('element-a');
      ea.setAttribute('onclick', 'onclick-handler');

      expect(function() {
        reactDomAssertion.assertSameAsString(expected, ea, {
          additionalCheckedAttributes: ['onclick']
        });
      }).to.throw(/expected tag element-a to not have onclick but got: onclick-handler/);
    });

    it('continues checking default checked attributes when additional ones are passed in', function() {
      var expected = '<element-a />';
      var document = jsdom('');

      var ea = document.createElement('element-a');
      ea.id = 'unexpected-id';

      expect(function() {
        reactDomAssertion.assertSameAsString(expected, ea, {
          additionalCheckedAttributes: ['onclick']
        });
      }).to.throw(/expected tag element-a to not have id but got: unexpected-id/);
    });

    it('recognizes passed in replacement checked attributes', function() {
      var expected = '<element-a />';
      var document = jsdom('');

      var ea = document.createElement('element-a');
      ea.setAttribute('onclick', 'onclick-handler');

      expect(function() {
        reactDomAssertion.assertSameAsString(expected, ea, {
          checkedAttributes: ['onclick']
        });
      }).to.throw(/expected tag element-a to not have onclick but got: onclick-handler/);
    });

    it('does not check default checked attributes when replacement ones are passed in', function() {
      var expected = '<element-a />';
      var document = jsdom('');

      var ea = document.createElement('element-a');
      ea.id = 'unexpected-id';

      reactDomAssertion.assertSameAsString(expected, ea, {
        checkedAttributes: ['onclick']
      });
    });

    it('checks replacement checked attributes when they and additional ones are passed in', function() {
      var expected = '<element-a />';
      var document = jsdom('');

      var ea = document.createElement('element-a');
      ea.setAttribute('onclick', 'onclick-handler');

      expect(function() {
        reactDomAssertion.assertSameAsString(expected, ea, {
          checkedAttributes: ['onclick'],
          additionalCheckedAttributes: ['align']
        });
      }).to.throw(/expected tag element-a to not have onclick but got: onclick-handler/);
    });

    it('checks additional checked attributes when they and replacement ones are passed in', function() {
      var expected = '<element-a />';
      var document = jsdom('');

      var ea = document.createElement('element-a');
      ea.setAttribute('align', 'left');

      expect(function() {
        reactDomAssertion.assertSameAsString(expected, ea, {
          checkedAttributes: ['onclick'],
          additionalCheckedAttributes: ['align']
        });
      }).to.throw(/expected tag element-a to not have align but got: left/);
    });

    it('does not check default checked attributes when replacement and additional ones are passed in', function() {
      var expected = '<element-a />';
      var document = jsdom('');

      var ea = document.createElement('element-a');
      ea.id = 'unexpected-id';

      reactDomAssertion.assertSameAsString(expected, ea, {
        checkedAttributes: ['onclick'],
        additionalCheckedAttributes: ['align']
      });
    });

    it('correctly reports mismatched text content', function() {
      var expected = '<element-a>element-a-text</element-a>';
      var document = jsdom('');

      var ea = document.createElement('element-a');
      ea.textContent = 'element-a-text-invalid';

      expect(function() {
        reactDomAssertion.assertSameAsString(expected, ea);
      }).to.throw(/mismatched text content: element-a-text != element-a-text-invalid/);
    });

    it('correctly reports missing text content', function() {
      var expected = '<element-a>element-a-text</element-a>';
      var document = jsdom('');

      var ea = document.createElement('element-a');
      expect(function() {
        reactDomAssertion.assertSameAsString(expected, ea);
      }).to.throw(/expected tag element-a to have 1 children but got 0/);
    });

    it('correctly reports unexpected text content', function() {
      var expected = '<element-a />';
      var document = jsdom('');

      var ea = document.createElement('element-a');
      ea.textContent = 'element-a-text';

      expect(function() {
        reactDomAssertion.assertSameAsString(expected, ea);
      }).to.throw(/expected tag element-a to have 0 children but got 1/);
    });

    it('correctly reports mismatched text and elements', function() {
      var expected =
        '<element-a>\n' +
        '  text-content-0\n' +
        '  <element-b />\n' +
        '  text-content-1\n' +
        '</element-a>';
      var document = jsdom('');

      var ea = document.createElement('element-a');

      var t0 = document.createTextNode('text-content-0');
      ea.appendChild(t0);

      var eb = document.createElement('element-b');
      ea.appendChild(eb);

      var ec = document.createElement('element-c');
      ea.appendChild(ec);

      expect(function() {
        reactDomAssertion.assertSameAsString(expected, ea);
      }).to.throw(/expected tag element-a to contain text but found tag element-c/);
    });
  });
});
