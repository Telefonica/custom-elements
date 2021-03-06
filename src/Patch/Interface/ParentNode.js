/**
 * @license
 * Copyright (c) 2016 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
 */

import CustomElementInternals from '../../CustomElementInternals.js';
import * as Utilities from '../../Utilities.js';

/**
 * @typedef {{
 *   prepend: !function(...(!Node|string)),
  *  append: !function(...(!Node|string)),
 * }}
 */
let ParentNodeNativeMethods;

/**
 * @param {!CustomElementInternals} internals
 * @param {!Object} destination
 * @param {!ParentNodeNativeMethods} builtIn
 */
export default function(internals, destination, builtIn) {
  /**
   * @param {!function(...(!Node|string))} builtInMethod
   * @return {!function(...(!Node|string))}
   */
  function appendPrependPatch(builtInMethod) {
    return /** @this {!Node} */ function(...nodes) {
      /**
       * A copy of `nodes`, with any DocumentFragment replaced by its children.
       * @type {!Array<!Node>}
       */
      const flattenedNodes = [];
      let flattenedNodesCount = 0;

      /**
       * Elements in `nodes` that were connected before this call.
       * @type {!Array<!Node>}
       */
      const connectedElements = [];
      let connectedElementsCount = 0;

      for (var i = 0, len = nodes.length; i < len; i++) {
        const node = nodes[i];

        if (node instanceof Element && Utilities.isConnected(node)) {
          connectedElements[connectedElementsCount++] = node;
        }

        if (node instanceof DocumentFragment) {
          for (let child = node.firstChild; child; child = child.nextSibling) {
            flattenedNodes[flattenedNodesCount++] = child;
          }
        } else {
          flattenedNodes[flattenedNodesCount++] = node;
        }
      }

      builtInMethod.apply(this, nodes);

      for (let i = 0, len = connectedElements.length; i < len; i++) {
        internals.disconnectTree(connectedElements[i]);
      }

      if (Utilities.isConnected(this)) {
        for (let i = 0, len = flattenedNodes.length; i < len; i++) {
          const node = flattenedNodes[i];
          if (node instanceof Element) {
            internals.connectTree(node);
          }
        }
      }
    };
  }

  if (builtIn.prepend !== undefined) {
    Utilities.setPropertyUnchecked(destination, 'prepend', appendPrependPatch(builtIn.prepend));
  }

  if (builtIn.append !== undefined) {
    Utilities.setPropertyUnchecked(destination, 'append', appendPrependPatch(builtIn.append));
  }
};
