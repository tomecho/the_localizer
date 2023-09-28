// test adding some dynamic content

function writeElement(text, blockTranslation) {
    const newNode = document.createElement('p');
    if (blockTranslation) {
        newNode.setAttribute('data-no-translate', 'true');
    }
    newNode.innerHTML = text;
    document.body.appendChild(newNode);
}

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        writeElement('Hello this is a dynamicly created element that should be translated');
    }, 300);

    setTimeout(() => {
        writeElement('Hello this is a dynamicly created element that should not be translated', true);
    }, 300);
});

document.querySelector('button').addEventListener('click', () => {
    writeElement('Hello this content was created by a button and should be translated');
});

InjectLocalizer({ supportLangs: ["es", "he"], fromLang: "en" });