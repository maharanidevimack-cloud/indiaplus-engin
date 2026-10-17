// ============================================================================
// INDIAPLUS v1 : SINGLE-FILE STANDALONE ENGINE WITH SIGNATURE CHECK (indiaplus.js)
// Architect: Shivam Kumar Jha (Shivam Brahman)
// ============================================================================

class IndiaplusLexer {
    constructor() {
        this.tokens = [];
        this.currentSection = null;
        this.currentPage = null;
    }

    tokenize(sourceCode) {
        this.tokens = [];
        this.currentSection = null;
        this.currentPage = null;

        const lines = sourceCode.split('\n');

        // 1. Mandatory Check: Pehli line mein "Namaste India+" hona hi chahiye
        let firstValidLine = "";
        for (let l of lines) {
            let trimmed = l.trim();
            if (trimmed.length > 0) {
                firstValidLine = trimmed;
                break;
            }
        }

        if (!firstValidLine.toLowerCase().includes("namaste india+")) {
            throw new Error("🚨 Indiaplus Error: File ki shuruat mein line 1 par 'Namaste India+' likhna anivarya hai!");
        }

        // 2. Line by line parsing
        lines.forEach((line, index) => {
            let cleanLine = line.trim();

            if (!cleanLine || cleanLine.startsWith('//') || cleanLine.toLowerCase().includes('namaste india+')) return;

            if (cleanLine.startsWith('[') && cleanLine.endsWith(']')) {
                this.currentSection = cleanLine.replace('[', '').replace(']', '').trim().toUpperCase();
                this.tokens.push({ type: 'SECTION_HEADER', value: this.currentSection, line: index + 1 });
                this.currentPage = null;
                return;
            }

            if (cleanLine.includes('=')) {
                let [key, val] = cleanLine.split('=').map(s => s.trim());
                if (this.currentSection === 'DESIGN' || this.currentSection === 'ACTION') {
                    this.currentPage = key;
                    this.tokens.push({ type: 'PAGE_HEADER', section: this.currentSection, pageName: this.currentPage, line: index + 1 });
                } else {
                    this.tokens.push({ type: 'KEY_VALUE', section: this.currentSection, key: key, value: val.replace(/"/g, ''), line: index + 1 });
                }
                return;
            }

            if (cleanLine.startsWith('-')) {
                let itemContent = cleanLine.substring(1).trim();
                this.tokens.push({ type: 'HINGLISH_ITEM', section: this.currentSection, page: this.currentPage, rawContent: itemContent, line: index + 1 });
            }
        });

        return this.tokens;
    }
}

class IndiaplusIntentMapper {
    constructor() {
        this.colorMap = {
            'black': '#000000', 'pura black': '#000000', 'kala': '#000000',
            'white': '#FFFFFF', 'pura white': '#FFFFFF', 'safed': '#FFFFFF',
            'red': '#EF4444', 'laal': '#EF4444',
            'blue': '#3B82F6', 'neela': '#3B82F6',
            'green': '#10B981', 'hara': '#10B981',
            'gray': '#64748B', 'grey': '#64748B', 'light gray': '#F1F5F9'
        };
        this.alignMap = {
            'center': 'center', 'centre': 'center', 'beech mein': 'center',
            'left': 'flex-start', 'baaye': 'flex-start',
            'right': 'flex-end', 'daaye': 'flex-end'
        };
    }

    parseItem(rawText) {
        let text = rawText.toLowerCase();
        let parsedIntent = { componentType: 'box', styles: {}, content: '' };

        if (text.includes('logo')) parsedIntent.componentType = 'logo';
        else if (text.includes('button')) parsedIntent.componentType = 'button';
        else if (text.includes('search bar') || text.includes('search box')) parsedIntent.componentType = 'input';
        else if (text.includes('text') || text.includes('likha')) parsedIntent.componentType = 'text';

        const quoteMatch = rawText.match(/"([^"]*)"/);
        if (quoteMatch) parsedIntent.content = quoteMatch[1];

        for (let key in this.colorMap) {
            if (text.includes(key)) {
                if (text.includes('background') || text.includes('bg')) {
                    parsedIntent.styles.backgroundColor = this.colorMap[key];
                } else {
                    parsedIntent.styles.color = this.colorMap[key];
                }
            }
        }

        for (let key in this.alignMap) {
            if (text.includes(key)) parsedIntent.styles.align = this.alignMap[key];
        }

        if (text.includes('gol') || text.includes('round')) parsedIntent.styles.borderRadius = '50%';

        return parsedIntent;
    }
}

class IndiaplusVM {
    constructor() {
        this.container = document.createElement('div');
        this.container.id = "indiaplus-root";
        this.container.style.cssText = "margin:0; padding:20px; width:100vw; height:100vh; box-sizing:border-box; background:#000; font-family:sans-serif;";
        document.body.appendChild(this.container);

        this.lexer = new IndiaplusLexer();
        this.mapper = new IndiaplusIntentMapper();
        this.pages = {};
    }

    run(sourceCode) {
        try {
            const tokens = this.lexer.tokenize(sourceCode);
            this.buildASTAndRender(tokens);
        } catch (error) {
            this.container.innerHTML = `<h3 style="color:red; font-family:monospace; padding:20px;">${error.message}</h3>`;
            console.error(error);
        }
    }

    buildASTAndRender(tokens) {
        this.pages = {};
        let activePage = null;

        tokens.forEach(token => {
            if (token.type === 'PAGE_HEADER') {
                activePage = token.pageName;
                if (!this.pages[activePage]) this.pages[activePage] = [];
            } else if (token.type === 'HINGLISH_ITEM' && activePage) {
                let parsedComponent = this.mapper.parseItem(token.rawContent);
                this.pages[activePage].push(parsedComponent);
            }
        });

        const firstPageName = Object.keys(this.pages)[0];
        if (firstPageName) this.renderPage(firstPageName);
    }

    renderPage(pageName) {
        if (!this.pages[pageName]) return;
        this.container.innerHTML = '';
        const components = this.pages[pageName];

        components.forEach(comp => {
            const el = this.createComponentElement(comp);
            this.container.appendChild(el);
        });
    }

    createComponentElement(comp) {
        let el;
        if (comp.componentType === 'button') {
            el = document.createElement('button');
            el.innerText = comp.content || 'Button';
            el.style.cssText = "padding:12px 24px; border:none; cursor:pointer;";
        } else if (comp.componentType === 'input') {
            el = document.createElement('input');
            el.type = 'text';
            el.placeholder = comp.content || 'Search...';
            el.style.cssText = "padding:10px 16px; border:1px solid #CCC; width:80%; border-radius:8px;";
        } else if (comp.componentType === 'logo') {
            el = document.createElement('div');
            el.innerText = comp.content || 'LOGO';
            el.style.cssText = "display:flex; align-items:center; justify-content:center; width:80px; height:80px; font-weight:bold;";
        } else {
            el = document.createElement('div');
        }

        if (comp.styles.backgroundColor) el.style.backgroundColor = comp.styles.backgroundColor;
        if (comp.styles.color) el.style.color = comp.styles.color;
        if (comp.styles.borderRadius) el.style.borderRadius = comp.styles.borderRadius;
        if (comp.styles.align === 'center') el.style.margin = '15px auto';

        return el;
    }
}
