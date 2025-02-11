// ==UserScript==
// @version         1.0.0
// @name            Proton Calendar (library)
// @author          Jeremy Harnois
// @supportURL      https://github.com/jeremy-harnois/user-scripts/issues
// @namespace       https://github.com/jeremy-harnois/user-scripts
// ==/UserScript==

/* exported doNotDimPastEventsIn */

function doNotDimPastEventsIn(calendars = []) {
  const calendarSelectors = () => calendars.map(calendar => {
    try {
      const nav = document.querySelector('nav');
      const navItem = nav.querySelector(`[title="${calendar}"]`).closest('.navigation-item');
      const rgbColor = window.getComputedStyle(navItem.querySelector('.checkbox-fakecheck')).borderColor;
      const hexColor = '#' + rgbColor.replace('rgb(', '').replace(')', '')
        .split(', ')
        .map(val => parseInt(val)).map(int => int.toString(16))
        .map(hex => 1 === hex.length ? '0' + hex : hex)
        .join('');

      console.log('[Proton Calendar]', `Styling past ${calendar} events like future ${calendar} events`);

      return `.isPast[style*="${hexColor}"]`;
    } catch (e) {
      console.warn('[Proton Calendar]', `Unable to find a calendar named '${calendar}'`);
      return false;
    }
  }).filter(selector => !!selector).join(',');

  if (calendars.length) {
    (new MutationObserver((records, observer) => {
      records.forEach(record => {
        if (record.target.matches('.app-root')) {
          record.addedNodes.forEach(node => {
            const nav = node.querySelector('nav');
            const main = node.querySelector('main');

            if (nav && main) {
              observer.disconnect();

              const selectors = calendarSelectors();

              (new MutationObserver((records, ) => {
                records.forEach(record => {
                  switch (record.type) {
                    case 'attributes':
                      if (record.target.matches(selectors)) {
                        record.target.classList.remove('isPast');
                      }
                      break;
                    case 'childList':
                      record.addedNodes.forEach(node => {
                        node.querySelector(selectors)?.classList.remove('isPast');
                      });
                      break;
                  }
                });
              })).observe(
                main, {
                  subtree: true,
                  childList: true,
                  attributes: true
                }
              );
            }
          });
        }
      });
    })).observe(
      document.querySelector('.app-root'), {
        subtree: false,
        childList: true,
        attributes: false
      }
    );
  }
}
