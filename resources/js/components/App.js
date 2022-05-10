import React from 'react';
import ReactDOM from 'react-dom';

function App() {
    return (
        <div>
            This is page for react app
        </div>
    );
}

export default App;

if (document.getElementById('app')) {
    ReactDOM.render(<App />, document.getElementById('app'));
}
