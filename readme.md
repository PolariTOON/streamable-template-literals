# Streamable Template Literals

A `stream` function that can be used as a tag on a template literal and that returns an async iterable of strings. On async iteration, it lazily and recursively calls functions, awaits promises and iterates both sync and async iterables.

```js
const listAsStream = stream`\
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
const listAsString = (await Array.fromAsync(listAsStream)).join("");
//	<ul>
//		<li>
//			<p>a</p>
//		</li>
//		<li>
//			<p>b</p>
//		</li>
//		<li>
//			<p>c</p>
//		</li>
//	</ul>
```
