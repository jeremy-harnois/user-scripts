// ==UserScript==
// @version         1.0.0
// @name            Proton (library)
// @author          Jeremy Harnois
// @supportURL      https://github.com/jeremy-harnois/user-scripts/issues
// @namespace       https://github.com/jeremy-harnois/user-scripts
// ==/UserScript==

/* exported waitUntilAppLoads */

function waitUntilAppLoads(selectors, {
  observable = '.app-root',
  observeOptions = {
    subtree: false,
    childList: true,
    attributes: false
  }
} = {}) {
  return new Promise((resolve, ) => {
    (new MutationObserver((records, observer) => {
      records.forEach(record => {
        record.addedNodes.forEach(node => {
          const elements = selectors.map(selector => node.querySelector(selector));

          if (elements.filter(element => null !== element).length === selectors.length) {
            observer.disconnect();
            resolve(elements);
          }
        });
      });
    }))
    .observe(document.querySelector(observable), observeOptions);
  });
}
