Element.prototype.writeTestElement = function (text, blockTranslation) {
    const newNode = document.createElement('p');
    if (blockTranslation) {
        newNode.setAttribute('data-no-translate', 'true');
    }
    newNode.innerHTML = text;
    this.appendChild(newNode);
}

document.addEventListener('DOMContentLoaded', () => {
    const delayedArticle = document.querySelector('#article-delayed');

    setTimeout(() => {
        delayedArticle
            .writeTestElement('Hello this is a dynamicly created element that should be translated');
    }, 300);

    setTimeout(() => {
        delayedArticle
            .writeTestElement('Hello this is a dynamicly created element that should not be translated', true);
    }, 300);
});

document
    .querySelector('#article-manual button')
    .addEventListener('click', () => {
        document
            .querySelector('#article-manual')
            .writeTestElement('Hello this content was created by a button and should be translated');
    });

InjectLocalizer({ supportLangs: ["es", "he"], fromLang: "en" });