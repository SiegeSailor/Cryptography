type ChalkStyle = ((value: unknown) => string) & {
  bold: ChalkStyle;
  italic: ChalkStyle;
  red: ChalkStyle;
  cyan: ChalkStyle;
  gray: ChalkStyle;
  greenBright: ChalkStyle;
  bgCyan: ChalkStyle;
};

const STYLE_CODES = {
  bold: 1,
  italic: 3,
  red: 31,
  cyan: 36,
  gray: 90,
  greenBright: 92,
  bgCyan: 46,
} as const;

function applyStyle(codes: number[], value: unknown) {
  const text = String(value);
  if (codes.length === 0) {
    return text;
  }

  return `\u001b[${codes.join(";")}m${text}\u001b[0m`;
}

function createStyle(codes: number[] = []): ChalkStyle {
  const style = ((value: unknown) => applyStyle(codes, value)) as ChalkStyle;

  Object.defineProperties(style, {
    bold: {
      get: () => createStyle([...codes, STYLE_CODES.bold]),
    },
    italic: {
      get: () => createStyle([...codes, STYLE_CODES.italic]),
    },
    red: {
      get: () => createStyle([...codes, STYLE_CODES.red]),
    },
    cyan: {
      get: () => createStyle([...codes, STYLE_CODES.cyan]),
    },
    gray: {
      get: () => createStyle([...codes, STYLE_CODES.gray]),
    },
    greenBright: {
      get: () => createStyle([...codes, STYLE_CODES.greenBright]),
    },
    bgCyan: {
      get: () => createStyle([...codes, STYLE_CODES.bgCyan]),
    },
  });

  return style;
}

const chalk = createStyle();

export default chalk;
