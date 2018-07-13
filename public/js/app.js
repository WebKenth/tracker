/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "/";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(1);
module.exports = __webpack_require__(2);


/***/ }),
/* 1 */
/***/ (function(module, exports) {

var url = document.URL;

prepareTracker();
attachEvents();

function prepareTracker() {
    window.tracker = localStorage.getItem('tracker');
    if (!window.tracker) initializeTracker();
    window.tracker = JSON.parse(localStorage.getItem('tracker'));
    console.log('Tracker Prepared', { tracker: tracker });
    checkForNavigation();
}

function attachEvents() {
    console.log('Attaching Events');
    document.onclick = function (event) {
        return logEvent(event, 'MouseEvent');
    };
    document.oninput = function (event) {
        return logEvent(event, 'InputEvent');
    };
    window.onkeypress = function (event) {
        return logEvent(event, 'KeyboardEvent');
    };
}

function initializeTracker() {
    console.log('Tracker not present, initializing');
    var sessionKey = guid();
    console.log('New Tracking Session: ' + sessionKey);
    localStorage.setItem('tracker', JSON.stringify({
        session: sessionKey,
        client: {
            language: clientInformation.language,
            userAgent: clientInformation.userAgent,
            platform: clientInformation.platform
        },
        tracks: []
    }));
}

function checkForNavigation() {
    console.log('Checking for Navigation Change');
    console.log({ lastUrl: lastUrl, url: url });

    var lastUrl = getLastUrl();
    if (lastUrl !== url) {
        console.log('Navigation change detected. Creating Navigation Event');
        localStorage.setItem('tracker_last_url', url);
        tracker.tracks.push({
            type: 'navigation',
            from: lastUrl,
            to: url
        });
        updateLocalStorage();
    }
}

function getLastUrl() {
    lastUrl = localStorage.getItem('tracker_last_url');
    if (lastUrl === null) localStorage.setItem('tracker_last_url', url);
    return localStorage.getItem('tracker_last_url');
}

function logEvent(event, type) {
    var now = new Date();
    var clickedElement = getElementFromEvent(event);
    var element = generateElementInformation(clickedElement, event);

    var data = generateEventData(event, type);
    data.element = generateElementInformation(clickedElement, event);
    console.log('Event Caught');
    console.log(event);
    console.log(data);
    tracker.tracks.push(data);
    updateLocalStorage();
}

function generateEventData(event, type) {
    var data = initializeEventData(event);

    if (type === 'MouseEvent') data = generateMouseEventData(data, event);
    if (type === 'KeyboardEvent') data = generateKeyboardEventData(data, event);
    if (type === 'InputEvent') data = generateInputEventData(data, event);

    return data;
}

function initializeEventData(event) {
    var now = new Date();
    var data = {
        type: event.type,
        timestamp: event.timeStamp,
        url: url,
        client: {
            date: now,
            unix: now.getTime(),
            viewport: {
                height: window.innerHeight,
                width: window.innerWidth
            }
        },
        isTrusted: event.isTrusted,
        data: {}
    };
    return data;
}

function generateMouseEventData(data, event) {
    var eventFields = ['x', 'y', 'screenX', 'screenY', 'pageX', 'pageY', 'clientX', 'clientY', 'layerX', 'layerY'];
    data.data.cursor_position = {};
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
        for (var _iterator = eventFields[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            field = _step.value;

            data.data.cursor_position[field] = event[field];
        }
    } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
    } finally {
        try {
            if (!_iteratorNormalCompletion && _iterator.return) {
                _iterator.return();
            }
        } finally {
            if (_didIteratorError) {
                throw _iteratorError;
            }
        }
    }

    return data;
}

function generateKeyboardEventData(data, event) {
    var eventFields = ['key', 'code', 'charCode', 'altKey', 'ctrlKey', 'metaKey', 'shiftKey'];
    var _iteratorNormalCompletion2 = true;
    var _didIteratorError2 = false;
    var _iteratorError2 = undefined;

    try {
        for (var _iterator2 = eventFields[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
            field = _step2.value;

            data.data[field] = event[field];
        }
    } catch (err) {
        _didIteratorError2 = true;
        _iteratorError2 = err;
    } finally {
        try {
            if (!_iteratorNormalCompletion2 && _iterator2.return) {
                _iterator2.return();
            }
        } finally {
            if (_didIteratorError2) {
                throw _iteratorError2;
            }
        }
    }

    return data;
}

function generateInputEventData(data, event) {
    var eventFields = ['inputType', 'data'];
    var _iteratorNormalCompletion3 = true;
    var _didIteratorError3 = false;
    var _iteratorError3 = undefined;

    try {
        for (var _iterator3 = eventFields[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
            field = _step3.value;

            data.data[field] = event[field];
        }
    } catch (err) {
        _didIteratorError3 = true;
        _iteratorError3 = err;
    } finally {
        try {
            if (!_iteratorNormalCompletion3 && _iterator3.return) {
                _iterator3.return();
            }
        } finally {
            if (_didIteratorError3) {
                throw _iteratorError3;
            }
        }
    }

    return data;
}

function updateLocalStorage() {
    localStorage.setItem('tracker', JSON.stringify(tracker));
}

function getElementFromEvent(event) {
    return window.event ? window.event.srcElement : event.target;
}

function generateElementInformation(element, event) {
    var tree = generateElementSelector(event.path);
    return {
        tag: element.tagName,
        selector: tree.join(' '),
        type: element.type || '',
        tree: tree,
        value: element.value || null,
        checked: element.checked,
        selected: element.selected,
        innerHTML: element.innerHTML,
        outerHTML: element.outerHTML,
        position: element.getBoundingClientRect()
    };
}

function generateElementSelector(path) {
    var selector = [];
    var _iteratorNormalCompletion4 = true;
    var _didIteratorError4 = false;
    var _iteratorError4 = undefined;

    try {
        for (var _iterator4 = path.reverse()[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
            element = _step4.value;

            if (element.tagName === undefined) continue;
            var tag = element.tagName.toLowerCase();
            if (element.id) tag += '#' + element.id;else {
                var classList = element.classList.toString().replace(' ', '.');
                tag += classList ? '.' + classList : '';
            }
            selector.push(tag);
        }
    } catch (err) {
        _didIteratorError4 = true;
        _iteratorError4 = err;
    } finally {
        try {
            if (!_iteratorNormalCompletion4 && _iterator4.return) {
                _iterator4.return();
            }
        } finally {
            if (_didIteratorError4) {
                throw _iteratorError4;
            }
        }
    }

    return selector;
}

function guid() {
    return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, function (c) {
        return (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16);
    });
}

/***/ }),
/* 2 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ })
/******/ ]);