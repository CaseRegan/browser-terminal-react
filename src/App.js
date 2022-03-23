import React from 'react';
import Terminal from './Terminal';
import './App.css';

class App extends React.Component {
    constructor(props) {
        super(props);
        
        this.state = {
            rows: Math.floor(window.innerHeight / 15) - 1
        };
    }
    
    componentDidMount() {
        document.title = "user@browser-terminal.js";
        window.addEventListener('resize', this.handleResize);
    }
    
    handleResize = () => {
        this.setState({
            rows: Math.floor(window.innerHeight / 15) - 1
        });
    }
    
    render() {
        return (
            <div className="App">
            <Terminal rows={this.state.rows} userString="user@browser-terminal.js" />
            </div>
            );
        }
    }
    
    export default App;
