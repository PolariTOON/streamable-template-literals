import {deepEqual, rejects, ok} from "node:assert/strict";
import {describe, it} from "node:test";
import {stream} from "./index.js";
async function fromAsync(iterableOrAsyncIterable) {
	const array = [];
	for await (const item of iterableOrAsyncIterable) {
		array.push(item);
	}
	return array;
}
function from(iterable) {
	const array = [];
	for (const item of iterable) {
		array.push(item);
	}
	return array;
}
describe("stream", () => {
	it("should return an async iterable", () => {
		const asyncIterable = stream``;
		ok(Symbol.asyncIterator in asyncIterable);
	});
	it("should yield an empty string", async () => {
		const asyncIterable = stream``;
		const iterable = [""];
		deepEqual(await fromAsync(asyncIterable), from(iterable));
	});
	it("should yield strings", async () => {
		const asyncIterable = stream`${undefined}${null}${false}${0n}${0}${""}`;
		const iterable = ["", "undefined", "", "null", "", "false", "", "0", "", "0", "", "", ""];
		deepEqual(await fromAsync(asyncIterable), from(iterable));
	});
	it("should call functions", async () => {
		const asyncIterable = stream`${function () {
			return "function";
		}}${{
			apply() {
				return "callable";
			},
		}}`;
		const iterable = ["", "function", "", "callable", ""];
		deepEqual(await fromAsync(asyncIterable), from(iterable));
	});
	it("should call async functions and await the returned value", async () => {
		const asyncIterable = stream`${async function () {
			return "async function";
		}}${{
			then(resolve) {
				resolve(Promise.resolve("thenable"));
			},
		}}`;
		const iterable = ["", "async function", "", "thenable", ""];
		deepEqual(await fromAsync(asyncIterable), from(iterable));
	});
	it("should iterate generator functions", async () => {
		const asyncIterable = stream`${function* () {
			yield "generator function";
		}}${{
			[Symbol.iterator]() {
				let done = false;
				return {
					next() {
						if (done) {
							return {
								done,
							};
						}
						done = true;
						const value = {
							apply() {
								return "iterable";
							},
						};
						return {
							value,
						};
					},
				};
			},
		}}`;
		const iterable = ["", "generator function", "", "iterable", ""];
		deepEqual(await fromAsync(asyncIterable), from(iterable));
	});
	it("should iterate async generator functions and await the yielded values", async () => {
		const asyncIterable = stream`${async function* () {
			yield "async generator function";
		}}${{
			[Symbol.asyncIterator]() {
				let done = false;
				return {
					async next() {
						if (done) {
							return {
								done,
							};
						}
						done = true;
						const value = {
							then(resolve) {
								resolve(Promise.resolve("async iterable"));
							},
						};
						return {
							value,
						};
					},
				};
			},
		}}`;
		const iterable = ["", "async generator function", "", "async iterable", ""];
		deepEqual(await fromAsync(asyncIterable), from(iterable));
	});
	it("should throw on other objects", async () => {
		const asyncIterable = stream`${{}}`;
		rejects(async () => {
			await fromAsync(asyncIterable);
		});
	});
	it("should throw on symbols", async () => {
		const asyncIterable = stream`${Symbol()}`;
		rejects(async () => {
			await fromAsync(asyncIterable);
		});
	});
	it("should be composable", async () => {
		const asyncIterable = stream`\
<ul>
${
	async function* () {
		for (const k of ["a", "b", "c"]) {
			yield* stream`\
	<li>
		<p>${k}</p>
	</li>
`;
		}
	}
}\
</ul>
`;
		const iterable = [
			"<ul>\n",
			"\t<li>\n\t\t<p>",
			"a",
			"</p>\n\t</li>\n",
			"\t<li>\n\t\t<p>",
			"b",
			"</p>\n\t</li>\n",
			"\t<li>\n\t\t<p>",
			"c",
			"</p>\n\t</li>\n",
			"</ul>\n",
		];
		deepEqual(await fromAsync(asyncIterable), from(iterable));
	});
});
