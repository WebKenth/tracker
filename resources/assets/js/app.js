let url = document.URL;
let userIsTyping = null;
let userEventData = [];
let logEventData = true;
let lastUrl;
let uploadTimer = null;

const EVENTS_UPLOAD = false;
const EVENTS_UPLOAD_LIMIT = 10;
const EVENTS_UPLOAD_RATE = 30000; // miliseconds

prepareTracker();

function prepareTracker()
{
    window.tracker = localStorage.getItem('tracker');
    if(!window.tracker)
        initializeTracker();
    else{
        window.tracker = JSON.parse(localStorage.getItem('tracker'));
        console.log('Tracker Prepared', {tracker});
        checkForNavigation();
        attachEvents();
    }
}

function uploadEvents()
{
    if(!EVENTS_UPLOAD)
        return;

    fetch('/api/event', {
        method: 'POST',
        headers:{
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            key: window.tracker.session,
            events: window.tracker.events
        })
    }).then(response => response.json())
    .then( response => {
        console.log(response);
        window.tracker.events = [];
        updateLocalStorage();
    }).catch(console.error);
}

function attachEvents()
{
    console.log('Attaching Events')
    document.onclick = event => logEvent(event, 'MouseEvent')
    window.onkeydown = event => logEvent(event, 'KeyboardEvent')
    if(EVENTS_UPLOAD)
        uploadTimer = setTimeout(uploadEvents, EVENTS_UPLOAD_RATE);
}

function initializeTracker()
{
    console.log('Tracker not present, initializing');
    
    fetch('api/session', {
    method: 'POST',
    headers:{
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({    
        client: {
            language: clientInformation.language,
            userAgent: clientInformation.userAgent,
            platform: clientInformation.platform
        }
    })
    }).then( response => response.json() )
    .then(response => {
        let sessionKey = response.key;
        console.log('New Tracking Session: '+sessionKey);
        localStorage.setItem('tracker', JSON.stringify({
            session: sessionKey,
            events: []
        }));

        window.tracker = JSON.parse(localStorage.getItem('tracker'));
        console.log('Tracker Prepared', {tracker});
        checkForNavigation();
        attachEvents();
    })
    .catch(console.error);
}

function checkForNavigation()
{
    console.log('Checking for Navigation Change');

    lastUrl = getLastUrl();
    console.log({lastUrl, url});

    if(lastUrl !== url)
    {
        console.log('Navigation change detected. Creating Navigation Event');
        localStorage.setItem('tracker_last_url', url);
        logEvent(new Event('Navigation'), 'Navigation');
        updateLocalStorage();
        uploadEvents();
    }
}

function getLastUrl()
{
    lastUrl = localStorage.getItem('tracker_last_url');
    if(lastUrl === null)
        localStorage.setItem('tracker_last_url', url);
    return localStorage.getItem('tracker_last_url');
}

function logEvent(event, type)
{
    let data = generateEventData(event, type);
    // console.log('Event Caught', logEventData);
    // console.log(event);
    // console.log(data);
    if(logEventData)
    {
        tracker.events.push(data);
        if(tracker.events.length > EVENTS_UPLOAD_LIMIT && EVENTS_UPLOAD)
            uploadEvents();
        else
            updateLocalStorage();
    }
}

function generateEventData(event, type)
{
    let data = initializeEventData(event, type);
    let clickedElement = getElementFromEvent(event);
    let element = generateElementInformation(clickedElement,event);

    if(type === 'MouseEvent')
        data = generateMouseEventData(data, event);
    if(type === 'KeyboardEvent')
        data = generateUserInputData(data, event, clickedElement);
    if(type === 'Navigation')
        data = generateNavigationEventData(data, event);

    data.element = generateElementInformation(clickedElement,event);

    return data;
}

function initializeEventData(event, type)
{
    let now = new Date();
    let data = {
        type      : type,
        eventType : event.type,
        timestamp : event.timeStamp,
        url       : url,
        client: {
            date      : now,
            unix      : now.getTime(),
            viewport  : {
                height: window.innerHeight,
                width: window.innerWidth
            }
        },
        isTrusted: event.isTrusted,
        data: {}
    };
    return data;
}

function generateMouseEventData(data,event)
{
    let eventFields = [
        'x'       ,'y',
        'screenX' ,'screenY',
        'pageX'   ,'pageY',
        'clientX' ,'clientY',
        'layerX'  ,'layerY',
    ];
    data.data.cursor_position = {}
    for(let field of eventFields)
        data.data.cursor_position[field] = event[field];
    return data;
}

function generateUserInputData(data, event, element)
{
    let allowedElements = ['HTML','BODY'];
    let isAllowedThrough = allowedElements.indexOf(element.tagName) > -1;
    if(userIsTyping === null && !isAllowedThrough)
        markElementForInput(element);
    if(userIsTyping || isAllowedThrough)
        userEventData.push(generateKeyboardEventData({}, event))
    if(!userIsTyping || isAllowedThrough)
    {
        userIsTyping = null;
        data.data = userEventData;
        userEventData = [];
    }
    return data;
}
function markElementForInput(element)
{
    userIsTyping = true;
    logEventData = false;
    let attributeIsset = element.getAttribute('accepting-input');
    if(!attributeIsset)
    {
        element.addEventListener('blur', markElementInputStop, true);
        element.setAttribute('accepting-input', 'true');
    }
}

function markElementInputStop(event)
{
    let element = getElementFromEvent(event);
    element.removeAttribute('accepting-input');
    element.removeEventListener('blur', markElementInputStop, true);
    userIsTyping = false;
    logEventData = true;
    logEvent(event, 'KeyboardEvent');
}

function generateKeyboardEventData(data, event)
{
    let eventFields = [
        'key',
        'code',
        'keyCode',
        'charCode',
        'altKey',
        'ctrlKey',
        'metaKey',
        'shiftKey',
    ];
    for(let field of eventFields)
        data[field] = event[field];
    return data;
}

function generateInputEventData(data, event)
{
    let eventFields = [
        'inputType',
        'data',
    ];
    for(let field of eventFields)
        data.data[field] = event[field];
    return data;
}

function generateNavigationEventData(data, event)
{
    data.data['from'] = lastUrl;
    data.data['to'] = url;
    return data;
}

function updateLocalStorage()
{
    console.log('Event Length',tracker.events.length);
    localStorage.setItem('tracker', JSON.stringify(tracker));
}

function getElementFromEvent(event)
{
    return (window.event) ? window.event.srcElement : event.target;
}

function generateElementInformation(element,event)
{
    if(element === null) 
        return {};
    let tree = generateElementSelector(event.path);
    let elementData =  {
        tag: element.tagName,
        selector: tree.join(' '),
        type: element.type || '',
        tree: tree,
        value: element.value || null,
        checked: element.checked,
        selected: element.selected,
        position: element.getBoundingClientRect()
    };
    return elementData;
}

function generateElementSelector(path)
{
    let selector = [];
    for(let element of path.reverse())
    {
        if(element && element.tagName === undefined)
            continue;
        let tag = element.tagName.toLowerCase();
        if(element.id)
            tag += '#'+element.id;
        else
        {
            let classList = element.classList.toString().replace(' ', '.');
            tag += classList ? '.'+classList : '';
        }
        selector.push(tag);
    }
    return selector;
}

function guid() 
{
  return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
    (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
  )
}