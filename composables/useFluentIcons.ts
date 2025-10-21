import iconSet from "@iconify-json/fluent-emoji-high-contrast/icons.json";

export const getIconNames = () => Object.keys((iconSet as any).icons || {});
