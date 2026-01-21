import nextPlugin from "eslint-config-next"

const eslintConfig = [
    {
        ignores: [".next/**", "node_modules/**", "out/**"],
    },
    ...nextPlugin,
]

export default eslintConfig
