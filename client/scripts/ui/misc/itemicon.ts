export const generateItemIcon = (icon) => {
  const iconStyle: React.CSSProperties = {};
  if (icon) {
    const { src, width = '100%', height = '100%', offset } = icon;
    iconStyle.backgroundImage = `url("${src.src}")`;
    iconStyle.backgroundSize = `${width} ${height}`;
    if (offset) {
      iconStyle.backgroundPosition = `${offset.left} ${offset.top}`;
    }
		iconStyle.backgroundRepeat = 'no-repeat';
  }
  return iconStyle; 
}