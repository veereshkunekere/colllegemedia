/**
 * Typography presets.
 * Built from the recurring text patterns found across auth, feed, and chat screens.
 * Usage: const styles = useStyles((c) => ({ title: { ...Typography.h1, color: c.text } }))
 */
export const Typography = {
  h1: { fontSize: 36, fontWeight: 'bold' },        // auth screen titles
  h2: { fontSize: 28, fontWeight: '700' },          // create.jsx title
  h3: { fontSize: 22, fontWeight: '700' },          // profile username
  subtitle: { fontSize: 16 },                       // auth subtitle
  body: { fontSize: 15, lineHeight: 24 },           // post content, comment text
  bodySmall: { fontSize: 14, lineHeight: 20 },
  label: { fontSize: 13, fontWeight: '600' },
  caption: { fontSize: 12 },                        // timestamps
  button: { fontSize: 16, fontWeight: '700' },
  link: { fontSize: 15 },
};
