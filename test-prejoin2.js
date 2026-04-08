const React = require('react');
const ReactDOMServer = require('react-dom/server');
const { PreJoin } = require('@livekit/components-react');

// Mock out the Next.js router and hooks if needed, but PreJoin doesn't use Next.js hooks directly.
// Wait, PreJoin might use standard React hooks which can't be rendered outside a component.

function App() {
    return React.createElement(PreJoin, { onSubmit: () => { } });
}

try {
    const html = ReactDOMServer.renderToString(React.createElement(App));
    console.log(html);
} catch (e) {
    console.error("Failed to render:", e.message);
}
