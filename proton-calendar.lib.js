// ==UserScript==
// @version         1.2.0
// @name            Proton Calendar (library)
// @author          Jeremy Harnois
// @supportURL      https://github.com/jeremy-harnois/user-scripts/issues
// @namespace       https://github.com/jeremy-harnois/user-scripts
// ==/UserScript==

/* global waitUntilAppLoads */
/* exported advanceOnMouseWheel, doNotDimPastEventsIn, goToTodayOnMouseClick */

/* @since 1.2.0 */
function goToTodayOnMouseClick({
  button = 1, // middle
  containerSelectors = [
    '.calendar-row-heading', // day and week view
    '.calendar-daygrid' // month view
  ]
} = {}) {
  waitUntilAppLoads(['header', 'main']).then(([header, main]) => {
    main.addEventListener('mousedown', (event) => {
      if (event.target.closest(containerSelectors.join(','))) {
        if (event.button === button) {
          header.querySelector('[data-testid="calendar-toolbar:today"]').click();
        }
      }
    });
  });
}

/* @since 1.1.0 */
function advanceOnMouseWheel({
  containerSelectors = [
    '.calendar-row-heading', // day and week view
    '.calendar-daygrid' // month view
  ],
  downAdvances = true
} = {}) {
	waitUntilAppLoads(['header', 'main']).then(([header, main]) => {
    main.addEventListener('wheel', (event) => {
      if (event.target.closest(containerSelectors.join(','))) {
        const button = (!!downAdvances ? 1 : -1) === Math.sign(event.deltaY) ? 'next' : 'previous';
        header.querySelector(`[data-testid="calendar-toolbar:${button}"]`).click();
      }
    });
  });
}

/* @since 1.0.0 */
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
    waitUntilAppLoads(['main']).then(([main]) => {
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
    });
  }
}
