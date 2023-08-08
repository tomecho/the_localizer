interface InjectLocalizerOptions {
	// TODO
	ignoreSelectors: string[];
	fromLang: string;
	supportLangs: string[];
}

function buildUrl(from: string, to: string, text: string) {
	return `https://translate.googleapis.com/translate_a/single?client=gtx&dt=t&sl=${from}&tl=${to}&q=${encodeURIComponent(
		text,
	)}`;
}

function selectLang(
	supportLangs: InjectLocalizerOptions["supportLangs"],
): string {
	return (
		navigator.languages.find((requestLang) =>
			supportLangs.includes(requestLang),
		) || ""
	);
}

function translateContent(
	{ fromLang, supportLangs }: InjectLocalizerOptions,
	nodes: Text[],
) {
	const toLang = "es" || selectLang(supportLangs);
	if (!toLang?.length) {
		console.error(
			"no suitable language between supported langs ",
			supportLangs,
			" and want langes",
			navigator.languages,
		);
		return;
	}

	if (nodes?.length) {
		for (const node of nodes) {
			const url = buildUrl(
				fromLang,
				toLang,
				node.textContent?.toString() as string,
			);
			fetch(url)
				.then((res) => res.json())
				.then((text: any) => {
					// TODO fix this any and figure out why the dynamic content isn't working!
					console.log(text[0][0][0]);
					node.textContent = text[0][0][0];
				});
		}
	}
}

function InjectLocalizer(opt: InjectLocalizerOptions) {
	// first thing we should do is add mutation observer
	const observer = new MutationObserver(() => {
		// TODO throttle this call for performance reasons?
		const mutatedElements = traverseContent(document.body);
		console.log("mutated elements", mutatedElements);

		translateContent(opt, initialElements);
	});
	observer.observe(document.body, {
		attributes: true,
		childList: true,
		subtree: true,
	});

	// now look at initial content
	const initialElements = traverseContent(document.body);
	console.log("initial elements", initialElements);

	// let's translate the content
	translateContent(opt, initialElements);
}

// build array of Text objects to be translated
function traverseContent(ele: ChildNode, accumulated: Text[] = []): Text[] {
	if (ele instanceof Text) {
		// this is just text
		// text doesn't have children
		const hasContent = ele.textContent?.trim() !== "";
		if (hasContent) {
			return accumulated.concat(ele);
		}
		return accumulated;
	} else {
		if ((ele as HTMLElement).attributes.getNamedItem("data-no-translate")) {
			// don't go any deeper, we were told not to!
			// TODO what happens if we don't want the surface to be translated but we do want the deeper nodes to be?!
			return accumulated;
		}

		return (
			Array
				// we use childNodes instead of children because it includes the raw text
				.from(ele.childNodes)
				.reduce((acc, curr) => traverseContent(curr, acc), accumulated)
		);
	}
}
