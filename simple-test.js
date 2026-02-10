console.log("Testing regex"); const re = /<\\s*\\\/?\\s*(?:think|thinking|thought|antthinking)\\b[^<>]*>/gi; const str = "test
test"; console.log("Matches:", Array.from(str.matchAll(re)).map(m => JSON.stringify(m[0])));
