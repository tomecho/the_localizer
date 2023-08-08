// test adding some dynamic content

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        const newNode = document.createElement('p');
        newNode.innerHTML = 'Hello this is a dynamicly created element that should be translated';
        document.body.appendChild(newNode);
    }, 300);

    setTimeout(() => {
        const newNode = document.createElement('p');
        newNode.setAttribute('data-no-translate', 'true');
        newNode.innerHTML = 'Hello this is a dynamicly created element that should not be translated';
        document.body.appendChild(newNode);
    }, 300);
});

InjectLocalizer({ supportLangs: ["es", "he"], fromLang: "en" });