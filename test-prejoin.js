const React = require('react');
const ReactDOMServer = require('react-dom/server');

// It's a client component, but we can do a shallow render or just look at the exported strings
const { PreJoin } = require('@livekit/components-react');

console.log(Object.keys(require('@livekit/components-react')));
