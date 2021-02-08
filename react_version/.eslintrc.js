module.exports = {
	// Specifies the ESLint parser
	parser: "@typescript-eslint/parser",
	extends: [
		"plugin:react/recommended",
		"plugin:@typescript-eslint/recommended",
		"prettier/@typescript-eslint",
		"plugin:prettier/recommended",
	],
	settings: {
		react: {
			version: "detect",
		},
	},
	env: {
		browser: true,
		node: true,
		es6: true,
	},
	plugins: ["@typescript-eslint", "react", "prettier"],
	parserOptions: {
		ecmaFeatures: {
			jsx: true,
		},
		// Allows for the parsing of modern ECMAScript features
		ecmaVersion: 2018,
		// Allows for the use of imports
		sourceType: "module",
	},
	rules: {
		"react/prop-types": "off",
		"@typescript-eslint/explicit-function-return-type": "off",
		"prettier/prettier": ["error", { useTabs: true }],
		"@typescript-eslint/interface-name-prefix": "off",
		"@typescript-eslint/no-explicit-any": "off",
		"@typescript-eslint/ban-ts-ignore": "off",
	},
	globals: { React: "writable" },
};
