export const colors = {
  paper: '#CBC6B0',
  panel: '#D9D1BD',
  ink: '#0A0F05',
  inkSoft: '#59594B',
  coral: '#DD709F',
  sunflower: '#C2A76A',
  mint: '#8FAE7C',
  grape: '#AD95C9',
  sky: '#7FA8A1',
  matcha: '#B7D09A',
  shadow: '#304A1E',
};

export const fontDisplay = "'Fredoka', ui-rounded, 'Segoe UI', sans-serif";
export const fontBody = "'Nunito', ui-rounded, 'Segoe UI', sans-serif";

/* Dark fills for the sidebar nav — light text sits on top. */
export const navAccents = {
  olive: '#304A1E',
  deepOlive: '#1F2F13',
  forest: '#253817',
  ink: '#0A0F05',
};

export const stickerShadow = (offset = 4) =>
  `${offset}px ${offset}px 0px ${colors.shadow}`;
