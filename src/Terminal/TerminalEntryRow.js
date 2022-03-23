import React from "react";

class TerminalEntryRow extends React.Component {
    constructor(props) {
        super(props);

        this.inputRef = React.createRef();
    }

    componentDidMount() {
        this.focus();
    }

    focus = () => {
        this.inputRef.current.focus();
    }

    setValue = (value) => {
        this.inputRef.current.value = value;
    }

    handleFormSubmit = (e) => {
        this.props.callback(this.inputRef.current.value);
        this.inputRef.current.value = '';
        e.preventDefault();
    }

    render() {
        const { path, userString } = this.props;

        return (
            <div className="terminal-row">
                <form onSubmit={this.handleFormSubmit}>
                    <label>{`${userString}:${path}$`}</label>
                    <input autoComplete="off" className="terminal-row terminal-entry" ref={this.inputRef} />
                </form>
            </div>
        )
    }
}

export default TerminalEntryRow;