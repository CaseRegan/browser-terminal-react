import React from "react";
import TerminalEntryRow from "./TerminalEntryRow";

import { ComputePath, ResolvePath, MakeDirectoryStructure } from "../MockDirectoryStructure/DirectoryStructure";

import './Terminal.css';

class Terminal extends React.Component {
    constructor(props) {
        super(props);

        this.directory = MakeDirectoryStructure();
        this.commandHistory = { index: 0, list: [] };
        this.inputRef = React.createRef();
        this.handleKeyDown = this.handleKeyDown.bind(this);

        this.state = {
            path: this.directory.name,
            lines: []
        };
    }

    componentDidMount() {
        document.addEventListener("keydown", this.handleKeyDown, false);
    }

    handleKeyDown(e) {
        if (e.key === 'ArrowUp') {
            let command = this.commandHistory.list.slice().reverse()[this.commandHistory.index];
            if (command) {
                this.commandHistory.index += 1;
                this.inputRef.current.setValue(command);
            }
        } else if (e.key === 'ArrowDown') {
            if (this.commandHistory.index > 0) {
                this.commandHistory.index -= 1;
                if (this.commandHistory.index === 0) {
                    this.inputRef.current.setValue('');
                } else {
                    this.inputRef.current.setValue(this.commandHistory.list.slice().reverse()[this.commandHistory.index]);
                }
            }
        } else if (e.key === 'Tab') {
            e.preventDefault();
            console.log("TODO tab autocompletion :)");
        }
    }

    addOutput(output) {
        let newLines = [];

        if (Array.isArray(output)) {
            newLines = newLines.concat(output);
        } else if (output) {
            newLines.push(String(output));
        }

        const toSet = this.state.lines.concat(newLines).slice(-1000);
        this.setState({
            lines: toSet
        });
    }

    clearLines() {
        this.setState({
            lines: []
        });
    }

    updateDirectory(node) {
        this.directory = node;
        this.setState({
            path: this.directory.name
        });
    }

    handleCommand(commandStr) {
        let args = commandStr.split(" ");
        let command = args.shift();
        if (command.length > 0) {
            this.commandHistory.list.push(commandStr);
        }
        this.commandHistory.index = 0;
        const toSet = this.state.lines.concat([`${this.props.userString}:${this.state.path}$ ${commandStr}`]).slice(-1000);
        this.setState({
            lines: toSet
        }, () => this.processCommand(command, args));
    }

    processCommand(command, args) {
        switch (command) {
            case "":
                break;
            case "cat":
                if (args.length === 0) {
                    // no op
                    // real cat command hangs and echos what you type
                } else {
                    let lines = [];

                    args.forEach((arg) => {
                        let node = ResolvePath(this.directory, arg);
                        if (!node) {
                            lines.push(`cat: ${arg}: No such file or directory`);
                        } else if (node.type === 'file') {
                            lines.push(node.data);
                        } else if (node.type === 'directory') {
                            lines.push(`cat: ${arg}: Is a directory`);
                        }
                    });
                    this.addOutput(lines);
                }
                break;
            case "cd":
                if (args.length > 1) {
                    this.addOutput("bash: cd: too many arguments");
                } else if (args.length === 0) {
                    // no op
                } else {
                    let node = ResolvePath(this.directory, args[0]);
                    if (!node) {
                        this.addOutput(`bash: cd: ${args[0]}: No such file or directory`);
                    } else if (node.type === 'directory') {
                        this.updateDirectory(node); 
                    } else {
                        this.addOutput(`bash: cd: ${args[0]}: Not a directory`);
                    }
                }
                break;
            case "clear":
                this.clearLines();
                break;
            case "ls":
                if (args.length === 0) {
                    let dirs = this.directory.dirs.map(dir => dir.name);
                    let files = this.directory.files.map(file => file.name);
                    this.addOutput(dirs.concat(files).join(' '));
                } else if (args.length === 1) {
                    let node = ResolvePath(this.directory, args[0]);
                    if (!node) {
                        this.addOutput(`ls: cannot access '${args[0]}': No such file or directory`);
                    } else if (node.type === 'file') {
                        this.addOutput(node.name);
                    } else {
                        let dirs = node.dirs.map(dir => dir.name);
                        let files = node.files.map(file => file.name);
                        this.addOutput(dirs.concat(files).join(' '));
                    }
                } else {
                    let lines = [];

                    args.forEach((arg) => {
                        let node = ResolvePath(this.directory, arg);
                        if (!node) {
                            lines.push(`ls: cannot access '${args[0]}': No such file or directory`);
                        } else if (node.type === 'file') {
                            lines.push(node.name);
                        } else {
                            let dirs = node.dirs.map(dir => dir.name);
                            let files = node.files.map(file => file.name);
                            lines.push(' ', `${arg}:`, dirs.concat(files).join(' '))
                        }
                        this.addOutput(lines);
                    });
                }
                break;
            case "pwd":
                this.addOutput(ComputePath(this.directory));
                break;
            default:
                this.addOutput(command + ": command not found");
        }
    }

    render() {
        const { rows, userString } = this.props;
        const { path, lines } = this.state;

        const visibleLines = lines.slice(-rows);
        const placeholderLines = rows > lines.length ? Array(rows-lines.length).fill("") : [];

        return (
            <div className="terminal" onClick={() => this.inputRef.current.focus()}>
                {visibleLines.map((line, index) => <div key={index} className="terminal-row">{line}</div>)}
                <TerminalEntryRow userString={userString} ref={this.inputRef} path={path} callback={this.handleCommand.bind(this)} />
                {placeholderLines.map((_, index) => <div key={index+visibleLines.length} className="terminal-row"></div>)}
            </div>
        );
    }
}

export default Terminal;