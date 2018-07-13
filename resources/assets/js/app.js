let url = document.URL;

prepareTracker();
attachEvents();

function prepareTracker(){
    window.tracker = localStorage.getItem('tracker');
    if(!window.tracker)
        initializeTracker();
    window.tracker = JSON.parse(localStorage.getItem('tracker'));
    console.log('Tracker Prepared', {tracker});
    checkForNavigation();
}

function attachEvents()
{
    console.log('Attaching Events');
    document.onclick = event => logEvent(event, 'MouseEvent')
    document.oninput = event => logEvent(event, 'InputEvent')
    window.onkeypress = event => logEvent(event, 'KeyboardEvent')
}

function initializeTracker()
{
    console.log('Tracker not present, initializing');
    let sessionKey = guid();
    console.log('New Tracking Session: '+sessionKey);
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

function checkForNavigation(){
    console.log('Checking for Navigation Change');
    console.log({lastUrl, url});

    let lastUrl = getLastUrl();
    if(lastUrl !== url)
    {
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

function getLastUrl()
{
    lastUrl = localStorage.getItem('tracker_last_url');
    if(lastUrl === null)
        localStorage.setItem('tracker_last_url', url);
    return localStorage.getItem('tracker_last_url');
}

function logEvent(event, type)
{
    let now = new Date();
    let clickedElement = getElementFromEvent(event);
    let element = generateElementInformation(clickedElement,event);

    let data = generateEventData(event, type);
    data.element = generateElementInformation(clickedElement,event);
    console.log('Event Caught');
    console.log(event);
    console.log(data);
    tracker.tracks.push(data);
    updateLocalStorage();
}

function generateEventData(event, type)
{
    let data = initializeEventData(event);

    if(type === 'MouseEvent')
        data = generateMouseEventData(data, event);
    if(type === 'KeyboardEvent')
        data = generateKeyboardEventData(data, event);
    if(type === 'InputEvent')
        data = generateInputEventData(data, event);

    return data;
}

function initializeEventData(event)
{
    let now = new Date();
    let data = {
        type      : event.type,
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
    for(field of eventFields)
        data.data.cursor_position[field] = event[field];
    return data;
}

function generateKeyboardEventData(data, event)
{
    let eventFields = [
        'key',
        'code',
        'charCode',
        'altKey',
        'ctrlKey',
        'metaKey',
        'shiftKey',
    ];
    for(field of eventFields)
        data.data[field] = event[field];
    return data;
}

function generateInputEventData(data, event)
{
    let eventFields = [
        'inputType',
        'data',
    ];
    for(field of eventFields)
        data.data[field] = event[field];
    return data;
}

function updateLocalStorage()
{
    localStorage.setItem('tracker', JSON.stringify(tracker));
}

function getElementFromEvent(event)
{
    return (window.event) ? window.event.srcElement : event.target;
}

function generateElementInformation(element,event)
{
    let tree = generateElementSelector(event.path);
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

function generateElementSelector(path)
{
    let selector = [];
    for(element of path.reverse())
    {
        if(element.tagName === undefined)
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

function guid() {
  return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
    (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
  )
}