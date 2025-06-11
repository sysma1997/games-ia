const subjects = {};

function attach(method, observer) {
    if (!subjects[method]) {
        subjects[method] = [];
    }
    
    subjects[method].push(observer);
}
function detach(method, observer) {
    if (!subjects[method]) return;

    const index = subjects[method].indexOf(observer);
    if (index !== -1) {
        subjects[method].splice(index, 1);
    }
}
function notify(method, ...args) {
    if (!subjects[method]) return;

    subjects[method].forEach(observer => {
        if (typeof observer === 'function') {
            observer(...args);
        } else if (typeof observer.update === 'function') {
            observer.update(...args);
        }
    });
}

export default { attach, detach, notify };