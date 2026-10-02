const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '..', 'script.js'), 'utf8');

function load(savedTheme, href = '#about') {
    const attrs = {};
    const listeners = {};
    const themeListeners = {};
    const anchorListeners = [];
    const label = { textContent: '' };
    const storage = new Map(savedTheme ? [['theme', savedTheme]] : []);
    const scrolls = [];
    const anchor = {
        getAttribute: () => href,
        addEventListener: (_, fn) => anchorListeners.push(fn),
    };
    const document = {
        documentElement: {
            setAttribute: (key, value) => { attrs[key] = value; },
            getAttribute: key => attrs[key],
        },
        getElementById: id => id === 'themeToggle'
            ? { addEventListener: (event, fn) => { themeListeners[event] = fn; } }
            : id === 'about' ? { scrollIntoView: options => scrolls.push(options) } : null,
        querySelector: selector => {
            assert.notEqual(selector, '#', 'bare fragments must not be CSS selectors');
            return selector === '.theme-label' ? label : null;
        },
        querySelectorAll: selector => selector === 'a[href^="#"]'
            || (selector === 'a[href="#"]' && href === '#') ? [anchor] : [],
        addEventListener: (event, fn) => { listeners[event] = fn; },
    };
    vm.runInNewContext(source, {
        document,
        localStorage: { getItem: key => storage.get(key), setItem: (key, value) => storage.set(key, value) },
    });
    return { attrs, label, storage, scrolls, listeners, toggle: themeListeners.click,
        click: () => anchorListeners.forEach(fn => fn.call(anchor, { preventDefault() {} })) };
}

test('first visit defaults to light; toggle persists dark and returns to light', () => {
    const page = load();
    assert.equal(page.attrs['data-theme'], 'light');
    assert.equal(page.label.textContent, 'Dark');
    page.toggle();
    assert.equal(page.attrs['data-theme'], 'dark');
    assert.equal(page.storage.get('theme'), 'dark');
    assert.equal(page.label.textContent, 'Light');
    page.toggle();
    assert.equal(page.attrs['data-theme'], 'light');
    assert.equal(page.storage.get('theme'), 'light');
});

test('returning visitor retains saved dark mode', () => {
    const page = load('dark');
    assert.equal(page.attrs['data-theme'], 'dark');
    assert.equal(page.label.textContent, 'Light');
});

test('section link scrolls to the matching ID', () => {
    const page = load();
    page.click();
    assert.equal(page.scrolls.length, 1);
    assert.equal(page.scrolls[0].behavior, 'smooth');
});

test('placeholder and missing section links do not throw', () => {
    for (const href of ['#', '#missing']) {
        const page = load(undefined, href);
        assert.doesNotThrow(page.click);
        assert.equal(page.scrolls.length, 0);
    }
});

test('optional upstream config renderer leaves static content alone when disabled', () => {
    const page = load();
    assert.doesNotThrow(page.listeners.DOMContentLoaded);
    const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
    assert.doesNotMatch(html, /<script\b[^>]*src=["']config\.js["']/i);
    assert.equal(fs.existsSync(path.join(__dirname, '..', 'config.js')), false);
});
