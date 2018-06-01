const vscode = require('vscode');

function homebreweryEnabled() {
    return vscode.workspace.getConfiguration('homebrewery').get('enabled');
}

function addWrapper(state) {
    if(state.tokens.length === 0 || !homebreweryEnabled()) {
        return;
    }
    if(state.tokens[0].type !== 'pageBr_open') {
        const open = new state.Token('pageBr_open', 'div', 1);
        open.attrPush(['class', 'phb']);
        open.attrPush(['id', 'p1']);
        open.attrPush(['style', 'margin-bottom: 30px;']);
        state.tokens.splice(0, 0, open);
    }
    if(state.tokens[state.tokens.length - 1].type !== 'pageBr_close') {
        const close = new state.Token('pageBr_close', 'div', -1);
        state.tokens.push(close);
    }
}

function replacePages(state) {
    if(state.tokens.length === 0 || !homebreweryEnabled()) {
        return;
    }

    let currentPage = 2;

    for (let i = state.tokens.length - 1; i >= 0; i--) {
        if (state.tokens[i].type !== 'inline') { continue; }
        if(state.tokens[i].content === '\\page') {
            let token;
            const inlineTokens = state.tokens[i].children;
            for(let j = inlineTokens.length - 1; j >= 0; j--) {
                token = inlineTokens[j];
                if(token.type === 'text') {
                    if(token.content === '\\page') {
                        replaceToken(state, i, currentPage);
                        currentPage++;
                        break;
                    }
                }
            }
        }
    }
}

function replaceToken(state, tokenPos, currentPage) {
    const close = new state.Token('pageBr_close', 'div', -1);    
    const open = new state.Token('pageBr_open', 'div', 1);
    open.attrPush(['class', 'phb']);
    open.attrPush(['style', 'margin-bottom: 30px;']);
    open.attrPush(['id', `p${currentPage}`])

    state.tokens[tokenPos-1] = close;
    state.tokens[tokenPos+1] = open;
    state.tokens.splice(tokenPos, 1);
}

module.exports = function replacePages_plugin(md, scheme) {
    md.core.ruler.before('replacements', 'homebrewery_wrapper', addWrapper);
    md.core.ruler.after('homebrewery_wrapper', 'homebrewery_pages', replacePages);
};