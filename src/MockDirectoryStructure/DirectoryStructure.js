function makeDirObject(name) {
    return {
        name: name,
        parent: null,
        files: [],
        dirs: [],
        type: 'directory'
    }
}

function makeFileObject(name, data) {
    return {
        name: name,
        data: data,
        type: 'file'
    }
}

function makeDirObjectFromParent(parent, childName) {
    let child = makeDirObject(childName);
    child.parent = parent;
    parent.dirs.push(child);

    return child;
}

function ResolvePath(node, path) {
    let pathArr;

    if (typeof path === 'string' || path instanceof String) {
        pathArr = path.includes("/") ? path.split("/").filter(p => p) : [path];
    } else {
        pathArr = path;
    }

    if (pathArr.length === 0) {
        return node;
    }

    let target = pathArr.shift();

    if (target === '.') {
        return ResolvePath(node, pathArr);
    } else if (target === '..') {
        return ResolvePath(node.parent, pathArr);
    } else {
        let toReturn = null;
        node.dirs.forEach((dir) => {
            if (dir.name === target) {
                toReturn = ResolvePath(dir, pathArr);
            }
        });
        node.files.forEach((file) => {
            if (file.name === target) {
                toReturn = file;
            }
        })
        return toReturn;
    }
}

function ComputePath(node, prevPath=[]) {
    if (node.name !== '/') {
        prevPath.unshift(node.name);
        return ComputePath(node.parent, prevPath);
    }
    return "/" + prevPath.join('/');
}

function MakeDirectoryStructure() {
    let root = makeDirObject('/');
    root.parent = root;
    root.files.push(
        makeFileObject('file1.txt', 'data1'),
        makeFileObject('file2.txt', 'data2')
    );

    let home = makeDirObjectFromParent(root, 'home');
    home.files.push(
        makeFileObject('file3.txt', 'data3')
    );

    return root;
}

export { ComputePath, ResolvePath, MakeDirectoryStructure };