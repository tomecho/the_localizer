interface InjectLocalizerOptions {
    ignoreSelectors: string[];
    fromLang: string;
    supportLangs: string[];
}


function buildUrl(from: string, to: string, text: string) {
    return `https://translate.googleapis.com/translate_a/single?client=gtx&dt=t&sl=${from}&tl=${to}&q=${encodeURIComponent(text)}`;
}

function InjectLocalizer(opt: InjectLocalizerOptions) {
    // find all elements inner text
    console.log(opt);

    console.log(traverseContent(document.body));

    // TODO add mutation observer to watch content get added https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver
    // TODO look at window.navigator.languages to figure out what toLang we should use.
}

// build array of Text objects to be translated
function traverseContent(ele: ChildNode, accumulated: Text[] = []): Text[] {
    if (ele instanceof Text) {
        // this is just text 
        // text doesn't have children
        const hasContent = ele.textContent?.trim() !== '';
        if (hasContent) {
            return accumulated.concat(ele);
        }
        return accumulated;
    } else {
        if ((ele as HTMLElement).attributes.getNamedItem('data-no-translate')) {
            // don't go any deeper, we were told not to!
            // TODO what happens if we don't want the surface to be translated but we do want the deeper nodes to be?!
            return accumulated;
        }

        return Array
            // we use childNodes instead of children because it includes the raw text
            .from(ele.childNodes)
            .reduce((acc, curr) => traverseContent(curr, acc), accumulated);
    }
}