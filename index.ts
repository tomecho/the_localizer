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

type ContentHash = string;
async function calcEleHistoryHash(content: string): Promise<ContentHash> {
	const digest = await crypto.subtle.digest(
		"SHA-1",
		new TextEncoder().encode(content),
	);
	const digestArr = new Uint8Array(digest);
	// @ts-ignore(2324) mapping between Uint8 and string is supported
	// TS doesn't support generics on the Uint8Array map typedef
	return digestArr.map((x) => `0${x.toString(16)}`.slice(-2)).join("");
}

function translateContent(
	{ fromLang, supportLangs }: InjectLocalizerOptions,
	nodes: Text[],
) {
	const toLang = selectLang(supportLangs);
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
				.then((text: string[][][]) => {
					node.textContent = text[0][0][0];
				});
		}
	}
}

// a map of element to hash of it's content
// TODO will this break when content changes after translation?
const translationEleHistory: Map<Text, ContentHash> = new Map();

async function InjectLocalizer(opt: InjectLocalizerOptions) {
	// first thing we should do is add mutation observer
	const observer = new MutationObserver(async () => {
		// TODO throttle this call for performance reasons?

		translationEleHistory.clear();
		const mutatedElements = await traverseContent(document.body);
		console.log("mutated elements", mutatedElements);

		translateContent(opt, mutatedElements);
	});
	observer.observe(document.body, {
		attributes: true,
		childList: true,
		subtree: true,
	});

	// now look at initial content
	const initialElements = await traverseContent(document.body);
	console.log("initial elements", initialElements);

	// let's translate the content
	translateContent(opt, initialElements);
}

// build array of Text objects to be translated
async function traverseContent(
	ele: ChildNode | Text,
	accumulated: Promise<Text[]> = Promise.resolve([]),
): Promise<Text[]> {
	if (ele instanceof Text) {
		// this is just text
		// text doesn't have children
		const trimmedContent = ele.textContent?.trim();
		const hasContent = trimmedContent && trimmedContent !== "";
		if (hasContent) {
			if (
				!translationEleHistory.has(ele) || // never seen the element before
				translationEleHistory.get(ele) ===
					(await calcEleHistoryHash(trimmedContent)) // or it's content has changed
			) {
				return Promise.resolve((await accumulated).concat(ele));
			}
		}
		return Promise.resolve(accumulated);
	} else {
		if ((ele as HTMLElement).attributes.getNamedItem("data-no-translate")) {
			// don't go any deeper, we were told not to!
			return accumulated;
		}

		// traverse children and flatten to a `accumulated: Text[]`
		return (
			Array
				// we use childNodes instead of children because it includes the raw text
				.from(ele.childNodes)
				.reduce((acc, curr) => traverseContent(curr, acc), accumulated)
		);
	}
}
