import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";

const eslintConfig = defineConfig([
  ...nextVitals,
  {
    rules: {
      "react/no-unescaped-entities": "off",
      // These two rules are new React-Compiler-prep additions in
      // eslint-plugin-react-hooks (bundled by eslint-config-next 16) that
      // flag *any* direct setState call inside a useEffect body, and *any*
      // read of ref.current during render. Both fire on idiomatic, safe
      // patterns used throughout this app: cancellation-guarded
      // fetch-on-mount loading flags, and the officially documented Redux
      // Toolkit "lazy singleton ref" pattern for Next.js App Router
      // (`if (!storeRef.current) storeRef.current = makeStore()` in
      // Store/StoreProvider.js). Disabled deliberately rather than
      // contorting otherwise-correct code around them.
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/refs": "off",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
]);

export default eslintConfig;
